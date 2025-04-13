const ConversationModel = require("../models/conversation.model");
const ConversationController = {};

ConversationController.joinRoom = async (socket, data) => {
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Lỗi khi rời phòng:", error);
    socket.emit("error", { message: "Lỗi khi rời phòng" });
  }
};

ConversationController.create = async (req, res) => {
  try {
    const conversation = await ConversationModel.createConversation(req.body);
    res.status(201).json({
      status: "success",
      message: "Tạo hội thoại thành công",
      conversation,
    });
  } catch (error) {
    console.error("Có lỗi khi tạo hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi tạo hội thoại" });
  }
};

ConversationController.get = async (req, res) => {
  const { user_id } = req.query;
  try {
    const conversations = await ConversationModel.getConversations(user_id);
    res.status(200).json({
      status: "success",
      message: "Lấy danh sách hội thoại thành công",
      conversations,
    });
  } catch (error) {
    console.error("Có lỗi khi lấy danh sách hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi lấy danh sách hội thoại" });
  }
};

ConversationController.delete = async (req, res) => {
  try {
    const result = await ConversationModel.deleteConversation(req.params.id);
    res.status(200).json({ status: "success", message: "Xóa thành công" });
  } catch (error) {
    console.error("Có lỗi khi xóa hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi xóa hội thoại" });
  }
};

ConversationController.update = async (req, res) => {
  try {
    const updatedConversation = await ConversationModel.updateConversation(
      req.params.id,
      req.body
    );
    res.status(200).json({ status: "success", updatedConversation });
  } catch (error) {
    console.error("Có lỗi khi cập nhật hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi cập nhật hội thoại" });
  }
};

ConversationController.getConversationsByUserId = async (req, res) => {
  const { user_id } = req.query;

  console.log("user_id", user_id);

  if (!user_id) {
    return res.status(400).json({ message: "Thiếu user_id" });
  }

  try {
    const conversations = await ConversationModel.getConversationByUserId(
      user_id
    );
    res.status(200).json({
      status: "success",
      message: "Lấy danh sách hội thoại thành công",
      conversations,
    });
  } catch (error) {
    console.error("Có lỗi khi lấy danh sách hội thoại:", error);
    res.status(500).json({ message: "Có lỗi khi lấy danh sách hội thoại" });
  }
};

module.exports = ConversationController;
