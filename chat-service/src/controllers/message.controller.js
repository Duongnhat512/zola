const MessageModel = require('../models/message.model.js')
const ConversationModel = require('../models/conversation.model.js')
const { userSocketMap, getUserSocketId } = require('../utils/online.helper.js')
const { uploadFile } = require('../services/file.service.js')
const MessageController = {}

MessageController.getMessages = async (socket, data) => {
  try {
    const messages = await MessageModel.getMessages(data.conversation_id);
    socket.emit("list_messages", messages);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

MessageController.sendMessage = async (socket, data) => {
  data.sender_id = socket.user.id;
  console.log("data", data);
  try {
    const savedMessage = await MessageModel.sendMessage(data);

    console.log("savedMessage", savedMessage);

    await ConversationModel.updateLastMessage(
      data.conversation_id,
      savedMessage.message_id
    );
    
    socket.emit("message_sent", savedMessage);
    socket.to(data.conversation_id).emit("new_message", savedMessage);

    return savedMessage;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
  }
};

MessageController.sendFile = async (socket, data) => {
  data.sender_id = socket.user.id
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
      user_id: socket.user.id,
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
  try {
    let conversation = await ConversationModel.findPrivateConversation(
      socket.user.id,
      data.receiver_id
    );

    if (!conversation) {
      conversation = await ConversationModel.createConversation({
        created_by: socket.user.id,
        name: "",
        type: "private",
        status: "active",
        members: [socket.user.id, data.receiver_id]
      });
    }

    socket.join(conversation.id);

    const fileResult = await MessageController.sendFile(socket, {
      ...data,
      conversation_id: conversation.id
    });

    const receiverSocketId = getUserSocketId(data.receiver_id);

    if (receiverSocketId) {
      const io = socket.server;
      const receiverSocket = io.sockets.sockets.get(receiverSocketId);

      if (receiverSocket) {
        receiverSocket.join(conversation.id);

        if (!conversation.last_message_id) {
          receiverSocket.emit('new_conversation', {
            conversation: conversation,
            message: fileResult
          });
        }

      }
    }

    return fileResult;
  } catch (error) {
    console.error('Error sending private file:', error);
    socket.emit('error', { message: 'Lỗi khi gửi file' });
    throw error;
  }
}

MessageController.deleteMessage = async (socket, data) => {
  try {
    const result = await MessageModel.deleteMessage(data.message_id);
    socket.emit("message_deleted", result);
    socket.broadcast.emit("message_deleted", result);
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi xóa tin nhắn" });
  }
};

MessageController.updateMessage = async (socket, data) => {
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
  data.sender_id = socket.user.id;
  try {
    let conversation = await ConversationModel.findPrivateConversation(
      socket.user.id,
      data.receiver_id
    );

    if (!conversation) {
      conversation = await ConversationModel.createConversation({
        created_by: socket.user.id,
        name: "",
        type: "private",
        status: "active",
        members: [socket.user.id, data.receiver_id]
      });

      console.log("Đã tạo conversation mới:", conversation.id);
    }

    socket.join(conversation.id);

    const messageData = {
      conversation_id: conversation.id,
      user_id: socket.user.id,
      sender_id: socket.user.id,
      receiver_id: data.receiver_id,
      message: data.message,
      type: data.type || "text",
      media: data.media || "",
      status: "sent",
      created_at: new Date().toISOString()
    };

    const message = await MessageModel.sendMessage(messageData);

    console.log("Đã gửi tin nhắn:", message);

    // await ConversationModel.updateLastMessage(conversation.id, message.message_id);

    const receiverSocketId = userSocketMap.get(data.receiver_id);

    if (receiverSocketId) {
      const io = socket.server;
      const receiverSocket = io.sockets.sockets.get(receiverSocketId);

      if (receiverSocket) {
        receiverSocket.join(conversation.id);

        receiverSocket.emit('new_conversation', {
          conversation: conversation,
          message: message
        });

      }
    }

    socket.emit('message_sent', {
      success: true,
      message: message
    });

    socket.to(conversation.id).emit('new_message', message);

    await ConversationModel.updateLastMessage(
      conversation.id,
      message.message_id
    );

    return { conversation, message };
  } catch (error) {
    console.error('Error sending first message:', error);
    socket.emit('error', { message: 'Lỗi khi gửi tin nhắn đầu tiên' });
    throw error;
  }
};

MessageController.getConversationMessages = async (req, res) => {
  const { conversation_id } = req.params;
  try {
    const messages = await MessageModel.getMessages(conversation_id);
    socket.emit("get_conversation_messages", messages);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

module.exports = MessageController;
