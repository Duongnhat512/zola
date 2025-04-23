const MessageModel = require('../models/message.model.js')
const ConversationModel = require('../models/conversation.model.js')
const { processFileUploadMessage } = require('../services/file.service.js')
const redisClient = require('../configs/redis.config.js')
const UserCacheService = require('../services/user-cache.service.js')
const { createNewPrivateConversation, updateConversationMetadata, increaseUnreadCount } = require('../services/conversation.service.js')
const { notifyMessageSent, notifyNewMessage, notifySendMessageError } = require('../services/socket.service.js')
const MessageController = {}

MessageController.getMessages = async (socket, data) => {
  try {
    console.log("user id: ", socket.user.id)

    const messages = await MessageModel.getMessages(data.conversation_id, socket.user.id);

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
//   data.sender_id = socket.user.id
//   const permissions = await UserCacheService.getConversationPermissions(socket.user.id, data.conversation_id);

//   if (!data.conversation_id) {
//     socket.emit("error", { message: "Thiếu conversation_id" });
//     return;
//   }

//   if (!data.message) {
//     socket.emit("error", { message: "Thiếu message" });
//     return;
//   }

//   try {
//     const message = await MessageModel.sendMessage(data);

//     await ConversationModel.updateLastMessage(
//       data.conversation_id,
//       message.message_id,
//     )

//     const sender = await UserCacheService.getUserProfile(message.sender_id);

//     const messagesWithSenderInfo = {
//       ...message,
//       sender_name: sender.fullname,
//       sender_avatar: sender.avt,
//     };

//     const timestamp = Date.now();

//     const members = await redisClient.smembers(`group:${data.conversation_id}`);

//     members.forEach(async (memberId) => {
//       await redisClient.zadd(
//         `chatlist:${memberId}`,
//         timestamp,
//         data.conversation_id
//       )

//       const socketIds = await redisClient.smembers(`sockets:${memberId}`);
//       socketIds.forEach((socketId) => {
//         if (socketId !== socket.id) {
//           socket.to(socketId).emit("new_message", { ...messagesWithSenderInfo });
//         }
//       });
//     });

//     socket.emit("message_sent", {
//       ...messagesWithSenderInfo
//     });

//   } catch (error) {
//     console.error("Lỗi khi gửi tin nhắn:", error);
//     socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
//   }
// };

MessageController.sendGroupMessage = async (socket, data) => {
  data.sender_id = socket.user.id

  if (!data.conversation_id) {
    socket.emit("error", { message: "Thiếu conversation_id" });
    return;
  }

  try {
    let fileUrl = "";
    let fileType = "text"

    if (data.file_data) {
      const result = await processFileUploadMessage(data.file_data, data.file_name, data.file_type, data.file_size);
      fileUrl = result.fileUrl;
      fileType = result.fileType;
    }

    const fileMessage = {
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      user_target: data.receiver_id || null,
      type: data.is_notify ? "notify" : fileType,
      message: data.message || null,
      media: fileUrl,
      file_name: data.file_name,

    };

    const [savedMessage, sender, members] = await Promise.all([
      MessageModel.sendMessage(fileMessage),
      UserCacheService.getUserProfile(socket.user.id),
      redisClient.smembers(`group:${data.conversation_id}`)
    ]);

    const message = {
      ...savedMessage,
      sender_name: sender?.fullname,
      sender_avatar: sender?.avt,
    };

    await Promise.all([
      notifyMessageSent(socket, message),
      notifyNewMessage(socket, message, members, socket.user.id),
      updateConversationMetadata(data.conversation_id, savedMessage.message_id, socket.user.id),
      increaseUnreadCount(data.conversation_id, socket.user.id)
    ]);

    return {
      ...fileMessage,
      file_url: fileUrl,
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
    let fileUrl = "";
    let fileType = "text"

    if (data.file_data) {
      const result = await processFileUploadMessage(data.file_data, data.file_name, data.file_type, data.file_size);
      fileUrl = result.fileUrl;
      fileType = result.fileType;
    }

    let conversation = await ConversationModel.findPrivateConversation(socket.user.id, data.receiver_id);
    if (!conversation) {
      conversation = await createNewPrivateConversation(socket.user.id, data.receiver_id);
    }

    const message = {
      conversation_id: conversation.id,
      sender_id: socket.user.id,
      receiver_id: data.receiver_id || null,
      type: fileType,
      message: data.message || null,
      media: fileUrl,
      file_name: data.file_name,
    };

    const [savedMessage, sender] = await Promise.all([
      MessageModel.sendMessage(message),
      UserCacheService.getUserProfile(socket.user.id)
    ]);

    const enhancedMessage = {
      ...savedMessage,
      sender_name: sender.fullname,
      sender_avatar: sender.avt,
    };

    await Promise.all([
      notifyMessageSent(socket, enhancedMessage),
      notifyNewMessage(socket, enhancedMessage, [data.receiver_id], socket.user.id),
      updateConversationMetadata(conversation.id, savedMessage.message_id, socket.user.id),
      increaseUnreadCount(conversation.id, socket.user.id)
    ]);

    return {
      ...message,
      file_url: fileUrl
    };
  } catch (error) {
    notifySendMessageError(socket, error);
  }
}

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

    const members = await redisClient.smembers(`group:${result.conversation_id}`);
    console.log("members: ", members)
    members.forEach(async (memberId) => {
      const socketIds = await redisClient.smembers(`sockets:${memberId}`);
      socketIds.forEach((socketId) => {
        if (socketId !== socket.id) {
          socket.to(socketId).emit("message_deleted", { message_id, message: "Tin nhắn đã thu hồi", conversation_id: result.conversation_id });
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

module.exports = MessageController;
