const redisClient = require("../configs/redis.config");
const ConversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");
const { uploadFile } = require("../services/file.service");
const axios = require("axios");
const UserCacheService = require("../services/user-cache.service");
const ConversationController = {};

ConversationController.joinRoom = async (socket, data) => {
  if (!data.conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    socket.join(data.conversation_id);

    socket.emit("joined_room", {
      conversation_id: data.conversation_id,
      message: "Đã tham gia phòng chat",
    });

    socket.to(data.conversation_id).emit("user_joined", {
      user_id: data.user_id,
      username: data.username,
      conversation_id: data.conversation_id,
      timestamp: Date.now(),
    });



  } catch (error) {
    console.error("Lỗi khi tham gia phòng:", error);
    socket.emit("error", { message: "Lỗi khi tham gia phòng" });
  }
};

ConversationController.leaveRoom = async (socket, data) => {
  try {
    socket.leave(data.conversation_id);

    socket.emit("left_room", {
      conversation_id: data.conversation_id,
      message: "Đã rời phòng chat",
    });

    socket.to(data.conversation_id).emit("user_left", {
      user_id: data.user_id,
      username: data.username,
      conversation_id: data.conversation_id,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Lỗi khi rời phòng:", error);
    socket.emit("error", { message: "Lỗi khi rời phòng" });
  }
};

ConversationController.createGroup = async (socket, data) => {
  try {
    if (data.file_data) {
      const fileBuffer = Buffer.from(data.file_data, "base64");

      const file = {
        originalname: data.file_name,
        mimetype: data.file_type || getMimeTypeFromFileName(data.file_name),
        buffer: fileBuffer,
        size: data.file_size || fileBuffer.length,
      }

      data.avatar = await uploadFile(file);
    }



    if (!data.members.includes(socket.user.id)) {
      data.members.push(socket.user.id);
    }

    const conversation = await ConversationModel.createConversation(
      { created_by: socket.user.id, type: "group", ...data }
    );

    const timestamp = Date.now();

    for (const member of data.members) {
      if (member === socket.user.id) {
        await UserCacheService.setConversationPermissions(member, conversation.id, 'owner');
      } else {
        await UserCacheService.setConversationPermissions(member, conversation.id, 'member');
      }

      await redisClient.zadd(`chatlist:${member}`, timestamp, conversation.id);
    }

    data.members.forEach(async (member) => {
      await redisClient.sadd(
        `group:${conversation.id}`, member)
    });

    const members = await redisClient.smembers(
      `group:${conversation.id}`
    );

    for (const member of members) {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      console.log(socketIds, "socketIds");
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("new_group", {
          conversation_id: conversation.id,
          message: "Bạn đã được thêm vào nhóm",
          group_name: conversation.name,
          group_avatar: conversation.avatar,
          created_by: socket.user.id,
          members: members,
        });
      });
    }

    console.log(conversation);


    socket.emit("group_created", {
      status: "success",
      message: "Tạo nhóm thành công",
      conversation: {
        conversation_id: conversation.id,
        name: conversation.name,
        avatar: conversation.avatar,
        members: members,
        created_by: socket.user.id,

      },
    });

  } catch (error) {
    console.error("Lỗi khi tạo nhóm:", error);
    socket.emit("error", { message: "Lỗi khi tạo nhóm" });
  }
}

ConversationController.updateGroupAvt = async (socket, data) => {
  try {
    if (data.file_data) {
      const fileBuffer = Buffer.from(data.file_data, "base64");

      const file = {
        originalname: data.file_name,
        mimetype: data.file_type || getMimeTypeFromFileName(data.file_name),
        buffer: fileBuffer,
        size: data.file_size || fileBuffer.length,
      }
      try {
        data.avatar = await uploadFile(file);
      } catch (error) {
        return socket.emit("error", { message: "lỗi uploadfile" + error });
      }

    }

    if (!data.conversation_id) {
      return socket.emit("error", { message: "Thiếu conversation_id" });
    }
    const result = await ConversationModel.updateAvtGroup(
      data.conversation_id,
      data.avatar
    );


    socket.emit("update_avt_group", {
      status: "success",
      message: "Cập nhật ảnh đại diện nhóm thành công",
      result,
    });

  } catch (error) {
    console.error("Có lỗi khi cập nhật ảnh đại diện nhóm:", error);
    socket.emit("error", { message: "Có lỗi khi cập nhật ảnh đại diện nhóm" });
  }

}

ConversationController.updateGroupName = async (socket, data) => {
  try {
    if (!data.conversation_id) {
      return socket.emit("error", { message: "Thiếu conversation_id" });
    }

    if (!data.name) {
      return socket.emit("error", { message: "Thiếu name" });
    }

    const result = await ConversationModel.updateConversationName(
      data.conversation_id,
      data.name
    );

    socket.emit("update_name_group", {
      status: "success",
      message: "Cập nhật tên nhóm thành công",
      result,
    });

    const members = await redisClient.smembers(
      `group:${data.conversation_id}`
    );

    for (const member of members) {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("update_name_group", {
          conversation_id: data.conversation_id,
          message: "Tên nhóm đã được cập nhật",
          name: data.name,
        });
      });
    }

  } catch (error) {
    console.error("Có lỗi khi cập nhật tên nhóm:", error);
    socket.emit("error", { message: "Có lỗi khi cập nhật tên nhóm" });
  }
}

ConversationController.getConversationsByUserId = async (req, res) => {
  const { user_id } = req.query;

  console.log("user_id", user_id);

  if (!user_id) {
    return res.status(400).json({ message: "Thiếu user_id" });
  }

  try {
    const conversationIds = await redisClient.zrevrange(`chatlist:${user_id}`, 0, 49);

    if (conversationIds.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "Không có hội thoại nào",
        conversations: [],
      });
    }

    const conversations = await ConversationModel.getConversationByUserId(
      user_id
    );

    const all_members = [];
    for (const conversation of conversations) {
      const members = await ConversationModel.getAllUserInConversation(
        conversation.conversation_id
      );

      let list_user_id = [];

      for (const member of members) {
        if (member.user_id !== user_id) {
          list_user_id.push(member.user_id);
        }
      }

      const last_message_id = await ConversationModel.getLastMessage(
        conversation.conversation_id
      );

      let last_message = {};

      if (!last_message_id) {
        all_members.push({
          conversation_id: conversation.conversation_id,
          last_message: last_message,
          list_user_id,
        });
        continue;
      } else {
        console.log("last_message_id", last_message_id);
        last_message = await MessageModel.getMessageById(last_message_id);
      }

      all_members.push({
        conversation_id: conversation.conversation_id,
        last_message: last_message,
        list_user_id,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lấy danh sách hội thoại thành công",
      all_members,
    });
  } catch (error) {
    console.error("Có lỗi khi lấy danh sách hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi lấy danh sách hội thoại" });
  }
};

ConversationController.getAllMemberInConversation = async (req, res) => {
  const { conversation_id } = req.query;

  if (!conversation_id) {
    return res.status(400).json({ message: "Thiếu conversation_id" });
  }

  try {
    const users = await ConversationModel.getAllUserInConversation(
      conversation_id
    );
    res.status(200).json({
      status: "success",
      message: "Lấy danh sách thành viên hội thoại thành công",
      users,
    });
  } catch (error) {
    console.error("Có lỗi khi lấy danh sách thành viên hội thoại:", error);
    res
      .status(500)
      .json({ message: "Có lỗi khi lấy danh sách thành viên hội thoại" });
  }
};

ConversationController.findPrivateConversation = async (req, res) => {
  const { user_id, friend_id } = req.query;

  if (!user_id || !friend_id) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }
  try {
    const conversation = await ConversationModel.findPrivateConversation(
      user_id,
      friend_id
    );

    if (!conversation) {
      const user_friend = await UserCacheService.getUserProfile(friend_id, req.headers.authorization);
      const newConversation = await ConversationModel.createConversation({
        created_by: user_id,
        type: "private",
        members: [
          user_id,friend_id
        ]
      });

      await redisClient.sadd(`group:${newConversation.id}`, user_id);
      await redisClient.sadd(`group:${newConversation.id}`, friend_id);

      newConversation.name = user_friend.fullname;
      newConversation.avatar = user_friend.avt;
      

      
      return res.status(200).json({
        status: "success",
        message: "Lấy cuộc hội thoại thành công",
        newConversation,
      });
    }
    

    const members = await ConversationModel.getAllUserInConversation(
      conversation.id
    );

    console.log("====================================");
    console.log(members);
    console.log("====================================");

    list_user_id = [];

    for (const member of members) {
      if (member.user_id !== user_id) {
        list_user_id.push(member.user_id);
      }
    }

    const last_message_id = await ConversationModel.getLastMessage(
      conversation.id
    );

    let last_message = {};

    if (!last_message_id) {
      conversation.last_message = last_message;
      conversation.list_user_id = list_user_id;
      conversation.conversation_id = conversation.id;
    } else {
      console.log("last_message_id", last_message_id);
      last_message = await MessageModel.getMessageById(last_message_id);
    }

    conversation.last_message = last_message;
    conversation.list_user_id = list_user_id;
    conversation.conversation_id = conversation.id;

    return res.status(200).json({
      status: "success",
      message: "Lấy cuộc hội thoại thành công",
      conversation,
    });
  } catch (error) {
    console.error("Có lỗi khi lấy hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi lấy hội thoại" });
  }
};

ConversationController.addMember = async (socket, data) => {
  const { user_id, conversation_id } = data;

  const permissions = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (permissions === 'member') {
    return socket.emit("error", { message: "Bạn không có quyền thêm thành viên" });
  }

  if (!permissions) {
    return socket.emit("error", { message: "Thiếu quyền truy cập" });
  }

  if (!user_id) {
    return socket.emit("error", { message: "Thiếu user_id" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    const result = await ConversationModel.addMember(
      user_id,
      conversation_id
    );

    const timestamp = Date.now();
    await redisClient.zadd(`chatlist:${user_id}`, timestamp, conversation_id);

    await redisClient.sadd(`group:${conversation_id}`, user_id);
    await UserCacheService.setConversationPermissions(user_id, conversation_id, 'member');

    const socketIds = await redisClient.smembers(`sockets:${user_id}`);
    socketIds.forEach((socketId) => {
      socket.to(socketId).emit("new_member", {
        conversation_id: conversation_id,
        message: "Bạn đã được thêm vào nhóm",
        user_id: user_id,
      });
    });

    socket.emit("add_member", {
      message: "Thêm thành viên thành công",
      result,
      user_id: user_id,
    });

  } catch (error) {
    console.error("Có lỗi khi thêm thành viên:", error);
    socket.emit("error", { message: "Có lỗi khi thêm thành viên" });
  }
};

ConversationController.removeMember = async (socket, data) => {
  const { user_id, conversation_id } = data;

  const permissions = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (permissions === 'member') {
    return socket.emit("error", { message: "Bạn không có quyền thêm thành viên" });
  }

  if (!permissions) {
    return socket.emit("error", { message: "Thiếu quyền truy cập" });
  }

  if (!user_id) {
    return socket.emit("error", { message: "Thiếu user_id" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    const result = await ConversationModel.removeMember(
      user_id,
      conversation_id
    );

    await redisClient.srem(`group:${conversation_id}`, user_id);
    await redisClient.zrem(`chatlist:${user_id}`, conversation_id);
    await UserCacheService.removePermissions(user_id, conversation_id);

    socket.emit("remove_member", {
      message: "Xóa thành viên thành công",
      user_id: user_id,
    });

    // Thông báo cho tất cả thành viên trong nhóm
    const members = await redisClient.smembers(`group:${conversation_id}`);

    console.log("members", members);
    
    members.forEach(async (member) => {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      console.log(socketIds, "socketIds");
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("user_left_group", {
          conversation_id: conversation_id,
          user_id: user_id,
          message: "Người dùng đã bị xóa khỏi nhóm",
        });
      });
    });

  } catch (error) {
    console.error("Có lỗi khi xóa thành viên:", error);
    socket.emit("error", { message: "Có lỗi khi xóa thành viên" });
  }
}

ConversationController.getConversations = async (socket, data) => {
  const user_id = socket.user.id;

  try {
    const conversationIds = await redisClient.zrevrange(`chatlist:${user_id}`, 0, 49);

    if (conversationIds.length === 0) {
      return socket.emit("conversations", {
        status: "success",
        message: "Không có hội thoại nào",
        conversations: [],
      });
    }

    const unreadConversations = await redisClient.smembers(`unread:${user_id}`);

    // lấy thông tin conversation
    let conversations = []

    for (const conversationId of conversationIds) {
      const conversation = await ConversationModel.getConversationById(conversationId);
      if (conversation) {

        let list_user_id = await redisClient.smembers(`group:${conversationId}`);
        list_user_id = await Promise.all(
          list_user_id.map(async (id) => {
            const permission = await UserCacheService.getConversationPermissions(id, conversationId);
            return { user_id: id, permission: permission };
          })
        );
        // list_user_id = list_user_id.filter((id) => id !== user_id);

        let name = conversation.name || "";
        let avt = conversation.avatar || "";

        if (conversation.type === "private") {
          const receiver = list_user_id.find((id) => id.user_id !== user_id);

          if (receiver) {
            const friend = await UserCacheService.getUserProfile(receiver.user_id, socket.handshake.headers.authorization);

            console.log("friend", friend);
            name = friend?.fullname || "";
            avt = friend?.avt || "";
          }
        }

        const last_message_id = conversation.last_message_id
        const last_message = last_message_id ? await MessageModel.getMessageById(last_message_id) : "";

        const isUnread = unreadConversations.includes(conversationId);
        const unreadCount = await ConversationController.getUnreadCount(user_id, conversationId);

        conversations.push({
          conversation_id: conversationId,
          name: name,
          avatar: avt,
          last_message: last_message,
          list_user_id,
          is_unread: isUnread,
          unread_count: unreadCount,
        });
      }
    }

    socket.emit("conversations", {
      status: "success",
      message: "Lấy danh sách hội thoại thành công",
      conversations,
    });

  } catch (error) {
    console.error("Có lỗi khi lấy danh sách hội thoại:", error);
    socket.emit("error", { message: "Có lỗi khi lấy danh sách hội thoại" });
  }
}

ConversationController.setPermisstions = async (socket, data) => {
  const { conversation_id, permissions, user_id } = data;

  const per = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (per === 'member') {
    return socket.emit("error", { message: "Bạn không có quyền cập nhật quyền" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  if (permissions !== 'owner' && permissions !== 'moderator' && permissions !== 'member') {
    return socket.emit("error", { message: "permissions không hợp lệ" });
  }

  try {
    const result = await ConversationModel.setPermissions(
      user_id,
      conversation_id,
      permissions
    );

    await UserCacheService.setConversationPermissions(user_id, conversation_id, permissions);

    if (permissions === 'owner' && per === 'owner') {
      await UserCacheService.setConversationPermissions(socket.user.id, conversation_id, 'member');
    }

    socket.emit("set_permissions", {
      status: "success",
      message: "Cập nhật quyền thành công",
      permissions: permissions,
      user_id: user_id,
    });

    const members = await redisClient.smembers(`group:${conversation_id}`);
    members.forEach(async (member) => {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      console.log(socketIds, "socketIds");
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("update_permissions", {
          conversation_id: conversation_id,
          user_id: user_id,
          permissions: permissions,
          message: `Quyền của thành viên ${user_id} đã được cập nhật`,
        });
      });
    });
  } catch (error) {
    console.error("Có lỗi khi cập nhật quyền:", error);
    socket.emit("error", { message: "Có lỗi khi cập nhật quyền" });
  }
}

// Tắt tiếng thành viên
ConversationController.muteMember = async (socket, data) => {
  const { conversation_id, user_id } = data;
  const permissions = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (permissions !== 'owner' || permissions !== 'moderator') {
    return socket.emit("error", { message: "Bạn không có quyền tắt tiếng thành viên" });
  }

  if (!permissions) {
    return socket.emit("error", { message: "Thiếu quyền truy cập" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  if (!user_id) {
    return socket.emit("error", { message: "Thiếu user_id" });
  }

  try {
    const result = await ConversationModel.muteMember(
      user_id,
      conversation_id
    );

    socket.emit("mute_member", {
      status: "success",
      message: "Đã tắt tiếng thành viên",
      result,
    });
  } catch (error) {
    console.error("Có lỗi khi tắt tiếng thành viên:", error);
    socket.emit("error", { message: "Có lỗi khi tắt tiếng thành viên" });
  }
}

// Giải tán nhóm
ConversationController.deleteConversation = async (socket, data) => {
  const { conversation_id } = data;

  const permissions = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (permissions !== 'owner') {
    return socket.emit("error", { message: "Bạn không có quyền giải tán nhóm" });
  }

  if (!permissions) {
    return socket.emit("error", { message: "Thiếu quyền truy cập" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    const members = await redisClient.smembers(`group:${conversation_id}`);

    const result = await ConversationModel.deleteConversation(conversation_id);

    for (const member of members) {
      await redisClient.zrem(`chatlist:${member}`, conversation_id);
      await UserCacheService.removePermissions(member, conversation_id);
    }

    await redisClient.del(`group:${conversation_id}`);

    socket.emit("delete_group", {
      status: "success",
      message: "Đã giải tán nhóm",
      result,
      conversation_id
    });

    // Thông báo cho tất cả thành viên trong nhóm
    members.forEach(async (member) => {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("group_deleted", {
          conversation_id: conversation_id,
          message: `Nhóm đã bị giải tán`,
        });
      });
    });

  } catch (error) {
    console.error("Có lỗi khi giải tán nhóm:", error);
    socket.emit("error", { message: "Có lỗi khi giải tán nhóm" });
  }
}

// Out nhóm
ConversationController.outGroup = async (socket, data) => {
  const { conversation_id } = data;

  const permissions = await UserCacheService.getConversationPermissions(socket.user.id, conversation_id);

  if (permissions === 'owner') {
    return socket.emit("error", { message: "Bạn không thể rời nhóm" });
  }

  if (!permissions) {
    return socket.emit("error", { message: "Thiếu quyền truy cập" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    const result = await ConversationModel.outGroup(socket.user.id, conversation_id);

    await redisClient.srem(`group:${conversation_id}`, socket.user.id);
    await redisClient.zrem(`chatlist:${socket.user.id}`, conversation_id);
    await UserCacheService.removePermissions(socket.user.id, conversation_id);

    socket.emit("out_group", {
      status: "success",
      message: "Đã rời nhóm",
      result,
    });

    // Thông báo cho tất cả thành viên trong nhóm
    const members = await redisClient.smembers(`group:${conversation_id}`);
    members.forEach(async (member) => {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("user_left_group", {
          conversation_id: conversation_id,
          user_id: socket.user.id,
          message: "Người dùng đã rời nhóm",
        });
      });
    });

  } catch (error) {
    console.error("Có lỗi khi rời nhóm:", error);
    socket.emit("error", { message: "Có lỗi khi rời nhóm" });
  }
}

ConversationController.markAsRead = async (socket, data) => {
  const { conversation_id } = data;
  const user_id = socket.user.id;

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    await ConversationController.resetUnreadCount(user_id, conversation_id);

    socket.emit("mark_as_read", {
      status: "success",
      message: "Đánh dấu hội thoại là đã đọc",
    });
  } catch (error) {
    console.error("Có lỗi khi đánh dấu hội thoại là đã đọc:", error);
    socket.emit("error", { message: "Có lỗi khi đánh dấu hội thoại là đã đọc" });
  }
}

ConversationController.getUnreadCount = async (user_id, conversation_id) => {
  try {
    const key = `unread_count:${user_id}:${conversation_id}`;
    const count = await redisClient.get(key)

    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error("Có lỗi khi lấy số lượng hội thoại chưa đọc:", error);
    return 0;
  }
}

ConversationController.increaseUnreadCount = async (conversation_id, exceptUserId = null) => {
  try {
    const members = await redisClient.smembers(`group:${conversation_id}`);

    for (const member of members) {
      if (member === exceptUserId) {
        continue;
      }

      const key = `unread_count:${member}:${conversation_id}`;
      await redisClient.incr(key);
      const newCount = await redisClient.get(key);
      await redisClient.sadd(`unread:${member}`, conversation_id);
    }
  } catch (error) {
    console.error("Có lỗi khi tăng số lượng hội thoại chưa đọc:", error);
  }
}

ConversationController.resetUnreadCount = async (user_id, conversation_id) => {
  try {
    const key = `unread_count:${user_id}:${conversation_id}`;
    await redisClient.set(key, 0);
    await redisClient.srem(`unread:${user_id}`, conversation_id);
  } catch (error) {
    console.error("Có lỗi khi đặt lại số tin nhắn chưa đọc:", error);
  }
}

module.exports = ConversationController;
