const MessageModel = require("../models/message.model.js");
const ConversationModel = require("../models/conversation.model.js");
const { userSocketMap } = require("../utils/online.helper.js");
const MessageController = {};

MessageController.getMessages = async (socket, data) => {
  try {
    const messages = await MessageModel.getMessages(data.conversation_id);
    socket.emit("get_messages", messages);
  } catch (error) {
    console.error("Lỗi khi nhận tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi nhận tin nhắn" });
  }
};

MessageController.sendMessage = async (socket, data) => {
  data.sender_id = socket.user.id;
  console.log("data", data.conversation_id);
  try {
    const savedMessage = await MessageModel.sendMessage(data);
    socket.emit("message_sent", savedMessage);
    socket.to(data.conversation_id).emit("new_message", savedMessage);
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
  }
};

MessageController.sendImage = async (socket, data) => {
  try {
    const savedMessage = await MessageModel.sendImage(data);
    socket.emit("image_sent", savedMessage);
    socket.to(data.conversation_id).emit("new_image", savedMessage);
  } catch (error) {
    console.error("Lỗi khi gửi hình ảnh:", error);
    socket.emit("error", { message: "Lỗi khi gửi hình ảnh" });
  }
};

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
        members: [socket.user.id, data.receiver_id],
      });

      console.log("Đã tạo conversation mới:", conversation.id);
    }

    socket.join(conversation.id);

    const messageData = {
      conversation_id: conversation.id,
      user_id: socket.user.id,
      receiver_id: data.receiver_id,
      message: data.message,
      type: data.type || "text",
      media: data.media || "",
      status: "sent",
      created_at: new Date().toISOString(),
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

        receiverSocket.emit("new_conversation", {
          conversation: conversation,
          message: message,
        });
      }
    }

    socket.emit("message_sent", {
      success: true,
      message: message,
    });

    socket.to(conversation.id).emit("new_message", message);

    return { conversation, message };
  } catch (error) {
    console.error("Error sending first message:", error);
    socket.emit("error", { message: "Lỗi khi gửi tin nhắn đầu tiên" });
    throw error;
  }
};

module.exports = MessageController;
