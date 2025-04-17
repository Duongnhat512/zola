const MessageModel = require('../models/message.model.js')
const ConversationModel = require('../models/conversation.model.js')
const { userSocketMap, getUserSocketId } = require('../utils/online.helper.js')
const { uploadFile } = require('../services/file.service.js')
const redisClient = require('../configs/redis.config.js')
const { getFileCategory } = require('../utils/file.helper')
const MessageController = {}

MessageController.getMessages = async (socket, data) => {
  try {
    console.log("user id: ", socket.user.id)
    const messages = await MessageModel.getMessages(data.conversation_id, socket.user.id);
    socket.emit("list_messages", messages);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

MessageController.sendGroupMessage = async (socket, data) => {
  if (!data.conversation_id) {
    socket.emit("error", { message: "Thiếu conversation_id" });
    return;
  }

  if (!data.message) {
    socket.emit("error", { message: "Thiếu message" });
    return;
  }

  try {
    const message = await MessageModel.sendMessage(data);
    
    const members = await redisClient.smembers(`group:${data.conversation_id}`);

    for (const member of members) {
      const socketIds = await redisClient.smembers(`sockets:${member}`);
      socketIds.forEach((socketId) => {
        socket.to(socketId).emit("new_message", {
          conversation_id: data.conversation_id,
          sender_id: socket.user.id,
          message
        });
      }); 
    }

  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
  }
};

MessageController.sendFile = async (socket, data) => {
  data.sender_id = socket.user.id

  if (!data.file_data) {
    socket.emit("error", { message: "Thiếu file_data" });
    return;
  }

  if (!data.file_name) {
    socket.emit("error", { message: "Thiếu file_name" });
    return;
  }

  try {
    const fileBuffer = Buffer.from(
      data.file_data.split('base64,')[1] || data.file_data,
      'base64'
    );

    const file = {
      originalname: data.file_name,
      mimetype: data.file_type || getMimeTypeFromFileName(data.file_name),
      buffer: fileBuffer,
      size: data.file_size || fileBuffer.length
    };

    const fileUrl = await uploadFile(file);

    const timestamp = new Date().toISOString();
    const fileMessage = {
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      user_target: data.receiver_id || null,
      type: "file",
      message: data.message || `Đã gửi file: ${data.file_name}`,
      media: fileUrl,
      file_name: data.file_name,
      file_type: file.mimetype,
      created_at: timestamp,
      updated_at: timestamp
    };

    const savedMessage = await MessageModel.sendMessage(fileMessage);

    if (data.conversation_id) {
      socket.to(data.conversation_id).emit('new_message', fileMessage);
    }

    socket.emit('file_sent', {
      success: true,
      message_id: savedMessage.message_id,
      file_url: fileUrl
    });

    return {
      ...fileMessage,
      file_url: fileUrl
    };
  } catch (error) {
    console.error("Error sending file:", error);
    socket.emit('error', {
      message: "Không thể gửi file",
      details: error.message
    });
    throw error;
  }
}

MessageController.sendPrivateFile = async (socket, data) => {
  if (!data.file_data) {
    socket.emit("error", { message: "Thiếu file_data" });
    return;
  }

  if (!data.file_name) {
    socket.emit("error", { message: "Thiếu file_name" });
    return;
  }

  if (!data.receiver_id) {
    socket.emit("error", { message: "Thiếu receiver_id" });
    return;
  }

  try {
    const fileBuffer = Buffer.from(
      data.file_data.split('base64,')[1] || data.file_data,
      'base64'
    );

    const file = {
      originalname: data.file_name,
      mimetype: data.file_type || getMimeTypeFromFileName(data.file_name),
      buffer: fileBuffer,
      size: data.file_size || fileBuffer.length
    };

    const fileType = getFileCategory(file.mimetype);

    const fileUrl = await uploadFile(file);

    const fileMessage = {
      conversation_id: data.conversation_id,
      sender_id: socket.user.id,
      receiver_id: data.receiver_id || null,
      type: fileType,
      message: data.message || `Đã gửi file: ${data.file_name}`,
      media: fileUrl,
      file_name: data.file_name,
    };

    const savedMessage = await MessageModel.sendMessage(fileMessage);

    const receiverSockets = await redisClient.smembers(`sockets:${data.receiver_id}`);
    const senderSockets = await redisClient.smembers(`sockets:${socket.user.id}`);

    receiverSockets.forEach((socketId) => {
      socket.to(socketId).emit("new_message", {
        ...fileMessage
      });
    });

    socket.emit("file_sent", {
      success: true,
      message_id: savedMessage.message_id,
      file_url: fileUrl
    });

    senderSockets.forEach((socketId) => {
      socket.to(socketId).emit("new_message", {
        ...fileMessage
      });
    });

    return {
      ...fileMessage,
      file_url: fileUrl
    };
  } catch (error) {
    console.error("Error sending file:", error);
    socket.emit('error', {
      message: "Không thể gửi file",
      details: error.message
    });
    throw error;
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

MessageController.sendPrivateMessage = async (socket, data) => {
  if (!data.receiver_id) {
    socket.emit("error", { message: "Thiếu receiver_id" });
    return;
  }

  if (!data.message) {
    socket.emit("error", { message: "Thiếu message" });
    return;
  }

  try {
    const message = await MessageModel.sendMessage(data);

    const receiverSockets = await redisClient.smembers(`sockets:${data.receiver_id}`);
    const senderSockets = await redisClient.smembers(`sockets:${socket.user.id}`);

    receiverSockets.forEach((socketId) => {
      socket.to(socketId).emit("new_message", {
        ...message
      });
    });

    socket.emit("message_sent", {
      ...message
    });

    senderSockets.forEach((socketId) => {
      socket.to(socketId).emit("new_message", {
        ...message
      });
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
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
  const message_id = data.query;

  if (!message_id) {
    socket.emit("error", { message: "Thiếu message_id" });
    return;
  }

  try {
    const result = await MessageModel.deleteMessageById(message_id);

    if (result.affectedRows === 0) {
      socket.emit("error", { message: "Không tìm thấy tin nhắn" });
      return;
    }
    socket.emit("message_deleted", { message_id });

    socket.to(data.conversation_id).emit("message_deleted", { message_id });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi xóa tin nhắn" });
  }
};

MessageController.setHiddenMessage = async (socket, data) => {
  const user_id = socket.user.id;
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
}

module.exports = MessageController;
