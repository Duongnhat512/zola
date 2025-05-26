const ConversationModel = require("../models/conversation.model.js");
const { processFileUploadMessage } = require("../services/file.service.js");
const redisClient = require("../configs/redis.config.js");
const UserCacheService = require("../services/user-cache.service.js");
const {
  createNewPrivateConversation,
  updateConversationMetadata,
  increaseUnreadCount,
} = require("../services/conversation.service.js");
const {
  notifyMessageSent,
  notifyNewMessage,
  notifySendMessageError,
} = require("../services/socket.service.js");
const MessageModel = require("../models/message.model.js");
const MessageController = {};

MessageController.getMessages = async (socket, data) => {
  try {
    console.log("user id: ", socket.user.id);

    const messages = await MessageModel.getMessages(
      data.conversation_id,
      socket.user.id
    );

    const messagesWithSenderInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = await UserCacheService.getUserProfile(message.sender_id);
        return {
          ...message,
          sender_name: sender?.fullname || null,
          sender_avatar: sender?.avt || null,
        };
      })
    );

    socket.emit("list_messages", messagesWithSenderInfo);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

MessageController.sendGroupMessage = async (socket, data) => {
  data.sender_id = socket.user.id;

  if (!data.conversation_id) {
    socket.emit("error", { message: "Thiếu conversation_id" });
    return;
  }

  try {
    // Xử lý nhiều file
    let processedFiles = [];
    let messageType = "text";

    // Kiểm tra nếu có nhiều file
    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
      // Xử lý từng file
      for (const file of data.files) {
        const result = await processFileUploadMessage(
          file.file_data,
          file.file_name,
          file.file_type,
          file.file_size
        );
        processedFiles.push({
          fileUrl: result.fileUrl,
          fileName: file.file_name,
          fileType: result.fileType,
          fileSize: file.file_size
        });
      }
      messageType = "multiple_files";
    } 
    // Xử lý file đơn (backward compatibility)
    else if (data.file_data) {
      const result = await processFileUploadMessage(
        data.file_data,
        data.file_name,
        data.file_type,
        data.file_size
      );
      processedFiles.push({
        fileUrl: result.fileUrl,
        fileName: data.file_name,
        fileType: result.fileType,
        fileSize: data.file_size
      });
      messageType = result.fileType;
    }

    const fileMessage = {
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      user_target: data.receiver_id || null,
      type: data.is_notify ? "notify" : messageType,
      message: data.message || null,
      media: processedFiles.length > 0 ? JSON.stringify(processedFiles) : null,
      file_name: processedFiles.length > 0 ? processedFiles.map(f => f.fileName).join(', ') : null,
      files_count: processedFiles.length
    };
    
    console.log('====================================');
    console.log(fileMessage);
    console.log('====================================');

    const [savedMessage, sender, members] = await Promise.all([
      MessageModel.sendMessage(fileMessage),
      UserCacheService.getUserProfile(socket.user.id),
      redisClient.smembers(`group:${data.conversation_id}`),
    ]);

    const message = {
      ...savedMessage,
      sender_name: sender?.fullname,
      sender_avatar: sender?.avt,
      processed_files: processedFiles // Thêm thông tin file đã xử lý
    };

    await Promise.all([
      notifyMessageSent(socket, message),
      notifyNewMessage(socket, message, members, socket.user.id),
      updateConversationMetadata(
        data.conversation_id,
        savedMessage.message_id,
        socket.user.id
      ),
      increaseUnreadCount(data.conversation_id, socket.user.id),
    ]);

    return {
      ...fileMessage,
      processed_files: processedFiles,
    };
  } catch (error) {
    notifySendMessageError(socket, error);
  }
};

MessageController.sendPrivateMessage = async (socket, data) => {
  if (!data.receiver_id) {
    socket.emit("error", { message: "Thiếu receiver_id" });
    return;
  }

  try {
    // Xử lý nhiều file
    let processedFiles = [];
    let messageType = "text";

    // Kiểm tra nếu có nhiều file
    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
      // Xử lý từng file
      for (const file of data.files) {
        const result = await processFileUploadMessage(
          file.file_data,
          file.file_name,
          file.file_type,
          file.file_size
        );
        processedFiles.push({
          fileUrl: result.fileUrl,
          fileName: file.file_name,
          fileType: result.fileType,
          fileSize: file.file_size
        });
      }
      messageType = "multiple_files";
    } 
    // Xử lý file đơn (backward compatibility)
    else if (data.file_data) {
      const result = await processFileUploadMessage(
        data.file_data,
        data.file_name,
        data.file_type,
        data.file_size
      );
      processedFiles.push({
        fileUrl: result.fileUrl,
        fileName: data.file_name,
        fileType: result.fileType,
        fileSize: data.file_size
      });
      messageType = result.fileType;
    }

    let conversation = await ConversationModel.findPrivateConversation(
      socket.user.id,
      data.receiver_id
    );
    if (!conversation) {
      conversation = await createNewPrivateConversation(
        socket.user.id,
        data.receiver_id
      );
    }

    const message = {
      conversation_id: conversation.id,
      sender_id: socket.user.id,
      receiver_id: data.receiver_id || null,
      type: messageType,
      message: data.message || null,
      media: processedFiles.length > 0 ? JSON.stringify(processedFiles) : null,
      file_name: processedFiles.length > 0 ? processedFiles.map(f => f.fileName).join(', ') : null,
      files_count: processedFiles.length
    };

    const [savedMessage, sender] = await Promise.all([
      MessageModel.sendMessage(message),
      UserCacheService.getUserProfile(socket.user.id),
    ]);
    
    console.log("sender: ", sender);
    

    const enhancedMessage = {
      ...savedMessage,
      sender_name: sender.fullname,
      sender_avatar: sender.avt,
      processed_files: processedFiles // Thêm thông tin file đã xử lý
    };

    await Promise.all([
      notifyMessageSent(socket, enhancedMessage),
      notifyNewMessage(
        socket,
        enhancedMessage,
        [data.receiver_id],
        socket.user.id
      ),
      updateConversationMetadata(
        conversation.id,
        savedMessage.message_id,
        socket.user.id
      ),
      increaseUnreadCount(conversation.id, socket.user.id),
    ]);

    return {
      ...message,
      processed_files: processedFiles,
    };
  } catch (error) {
    notifySendMessageError(socket, error);
  }
};

MessageController.updateMessage = async (socket, data) => {
  if (!data.message_id) {
    socket.emit("error", { message: "Thiếu message_id" });
    return;
  }

  if (!data.message) {
    socket.emit("error", { message: "Thiếu message" });
    return;
  }

  try {
    const message = await MessageModel.updateMessage(
      data.message_id,
      data.message
    );
    socket.emit("message_updated", message);
    socket.broadcast.emit("message_updated", message);
  } catch (error) {
    console.error("Lỗi khi cập nhật tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi cập nhật tin nhắn" });
  }
};

MessageController.getConversationMessages = async (socket, data) => {
  const conversation_id = data.conversation_id;

  if (!conversation_id) {
    socket.emit("error", { message: "Thiếu conversation_id" });
    return;
  }

  try {
    const messages = await MessageModel.getMessages(conversation_id);

    if (!messages) {
      socket.emit("error", { message: "Không tìm thấy tin nhắn" });
      return;
    }
    socket.emit("get_conversation_messages", messages);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

MessageController.deleteMessage = async (socket, data) => {
  const message_id = data.message_id;
  const user_id = socket.user.id;

  if (!message_id) {
    socket.emit("error", { message: "Thiếu message_id" });
    return;
  }

  try {
    const result = await MessageModel.deleteMessageById(message_id, user_id);

    if (result.affectedRows === 0) {
      socket.emit("error", { message: "Không tìm thấy tin nhắn" });
      return;
    }
    socket.emit("message_deleted", { message_id });

    const members = await redisClient.smembers(
      `group:${result.conversation_id}`
    );
    console.log("members: ", members);
    members.forEach(async (memberId) => {
      const socketIds = await redisClient.smembers(`sockets:${memberId}`);
      socketIds.forEach((socketId) => {
        if (socketId !== socket.id) {
          socket.to(socketId).emit("message_deleted", {
            message_id,
            message: "Tin nhắn đã thu hồi",
            conversation_id: result.conversation_id,
          });
        }
      });
    });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi xóa tin nhắn" });
  }
};

MessageController.setHiddenMessage = async (socket, data) => {
  const user_id = data.user_id;
  const message_id = data.message_id;

  if (!user_id) {
    socket.emit("error", { message: "Thiếu user_id" });
    return;
  }

  if (!message_id) {
    socket.emit("error", { message: "Thiếu message_id" });
    return;
  }

  try {
    const result = await MessageModel.setHiddenMessage(user_id, message_id);

    if (result.affectedRows === 0) {
      socket.emit("error", { message: "Không tìm thấy tin nhắn" });
      return;
    }
    socket.emit("message_hidden", { message_id });
  } catch (error) {
    console.error("Lỗi khi đánh dấu ẩn:", error);
    socket.emit("error", { message: "Lỗi khi đánh dấu ẩn" });
  }
};

MessageController.forwardMessage = async (socket, data) => {
  const { message_id, to_conversation_ids } = data;
  const user_id = socket.user.id;

  if (!message_id || !to_conversation_ids || !Array.isArray(to_conversation_ids) || to_conversation_ids.length === 0) {
    return socket.emit("error", { message: "Thiếu message_id hoặc to_conversation_ids" });
  }

  try {
    // Lấy nội dung tin nhắn gốc
    const originalMessage = await MessageModel.getMessageById(message_id);
    if (!originalMessage) {
      return socket.emit("error", { message: "Không tìm thấy tin nhắn gốc" });
    }

    const results = [];

    for (const to_conversation_id of to_conversation_ids) {
      // Tạo tin nhắn mới dựa trên tin nhắn gốc
      const newMessage = {
        conversation_id: to_conversation_id,
        sender_id: user_id,
        type: originalMessage.type,
        message: originalMessage.message,
        media: originalMessage.media,
        file_name: originalMessage.file_name,
        is_forwarded: true,
        forwarded_from: originalMessage.sender_id,
      };

      // Lưu tin nhắn mới
      const [savedMessage, sender, members] = await Promise.all([
        MessageModel.sendMessage(newMessage),
        UserCacheService.getUserProfile(user_id),
        redisClient.smembers(`group:${to_conversation_id}`),
      ]);

      const messageToSend = {
        ...savedMessage,
        sender_name: sender?.fullname,
        sender_avatar: sender?.avt,
        is_forwarded: true,
        forwarded_from: originalMessage.sender_id,
      };

      // Gửi tin nhắn đến các thành viên trong nhóm
      for (const member of members) {
        const socketIds = await redisClient.smembers(`sockets:${member}`);
        for (const socketId of socketIds) {
          socket.to(socketId).emit("new_message", messageToSend);
        }
      }

      results.push({
        conversation_id: to_conversation_id,
        message: messageToSend,
      });
    }

    // Gửi xác nhận về cho người chuyển tiếp
    socket.emit("message_forwarded", {
      status: "success",
      message: "Chuyển tiếp tin nhắn thành công",
      data: results,
    });

  } catch (error) {
    console.error("Có lỗi khi chuyển tiếp tin nhắn:", error);
    socket.emit("error", { message: "Có lỗi khi chuyển tiếp tin nhắn" });
  }
};

/**
 * Ghim tin nhắn trong cuộc hội thoại
 */
MessageController.pinMessage = async (socket, data) => {
  const { message_id, conversation_id, message_text } = data;
  const user_id = socket.user.id;

  if (!message_id) {
    return socket.emit("error", { message: "Thiếu message_id" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    // Kiểm tra quyền trong nhóm (nếu là group conversation)
    const isGroup = await ConversationModel.isGroupConversation(conversation_id);
    if (isGroup) {
      const permissions = await UserCacheService.getConversationPermissions(user_id, conversation_id);
      if (permissions !== 'owner' && permissions !== 'moderator') {
        return socket.emit("error", { message: "Bạn không có quyền ghim tin nhắn" });
      }
    }

    // Thực hiện ghim tin nhắn
    const result = await MessageModel.pinMessage(message_id, conversation_id, user_id);
    
    // Thông báo cho người dùng hiện tại
    socket.emit("pin_message_success", {
      status: "success",
      message: "Ghim tin nhắn thành công",
      pinned_message: result,
      conversation_id,
      message_text
    });

    // Thông báo cho các thành viên khác trong cuộc trò chuyện
    const members = await redisClient.smembers(`group:${conversation_id}`);
    for (const member of members) {
      if (member === user_id) continue; // Bỏ qua người ghim
      
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      for (const socketId of socketIds) {
        socket.to(socketId).emit("message_pinned", {
          status: "success",
          conversation_id,
          message_id,
          pinned_by: user_id,
          pinned_message: result,
          message: "Tin nhắn đã được ghim"
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi ghim tin nhắn:", error);
    socket.emit("error", { message: error.message || "Lỗi khi ghim tin nhắn" });
  }
};

/**
 * Bỏ ghim tin nhắn
 */
MessageController.unpinMessage = async (socket, data) => {
  const { message_id, conversation_id, message_text } = data;
  const user_id = socket.user.id;

  if (!message_id) {
    return socket.emit("error", { message: "Thiếu message_id" });
  }

  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    // Kiểm tra quyền trong nhóm (nếu là group conversation)
    const isGroup = await ConversationModel.isGroupConversation(conversation_id);
    console.log('====================================');
    console.log(isGroup);
    console.log('====================================');
    if (isGroup) {
      const permissions = await UserCacheService.getConversationPermissions(user_id, conversation_id);
      if (permissions !== 'owner' && permissions !== 'moderator') {
        return socket.emit("error", { message: "Bạn không có quyền bỏ ghim tin nhắn" });
      }
    }

    // Thực hiện bỏ ghim tin nhắn
    const result = await MessageModel.unpinMessage(message_id, conversation_id);

    console.log('====================================');
    console.log(result + "result");
    console.log('====================================');
    
    // Thông báo cho người dùng hiện tại
    socket.emit("unpin_message_success", {
      status: "success",
      message: "Bỏ ghim tin nhắn thành công",
      message_id,
      conversation_id,
      message_text
    });
    const members = await redisClient.smembers(`group:${conversation_id}`);
    // Thông báo cho các thành viên khác trong cuộc trò chuyện
    for (const member of members) {
      if (member === user_id) continue; // Bỏ qua người bỏ ghim
      
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      for (const socketId of socketIds) {
        socket.to(socketId).emit("message_unpinned", {
          conversation_id,
          message_id,
          unpinned_by: user_id,
          message: "Tin nhắn đã được bỏ ghim",
          message_text
        });
      }
    }
    
  } catch (error) {
    console.error("Lỗi khi bỏ ghim tin nhắn:", error);
    socket.emit("error", { message: error.message || "Lỗi khi bỏ ghim tin nhắn" });
  }
};

/**
 * Lấy danh sách tin nhắn ghim trong cuộc trò chuyện
 */
MessageController.getPinnedMessages = async (socket, data) => {
  const { conversation_id } = data;
  
  if (!conversation_id) {
    return socket.emit("error", { message: "Thiếu conversation_id" });
  }

  try {
    const pinnedMessages = await MessageModel.getPinnedMessages(conversation_id);
    
    // Thêm thông tin về người gửi tin nhắn
    const pinnedMessagesWithSenderInfo = await Promise.all(
      pinnedMessages.map(async (item) => {
        const messageData = item.message_data;
        const sender = await UserCacheService.getUserProfile(messageData.sender_id);
        const pinnedBy = await UserCacheService.getUserProfile(item.pinned_by);
        
        return {
          ...item,
          message_data: {
            ...messageData,
            sender_name: sender?.fullname || null,
            sender_avatar: sender?.avt || null,
          },
          pinned_by_name: pinnedBy?.fullname || null,
          pinned_by_avatar: pinnedBy?.avt || null,
        };
      })
    );
    
    socket.emit("pinned_messages", {
      status: "success",
      conversation_id,
      pinned_messages: pinnedMessagesWithSenderInfo
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn ghim:", error);
    socket.emit("error", { message: "Lỗi khi lấy danh sách tin nhắn ghim" });
  }
};

module.exports = MessageController;
