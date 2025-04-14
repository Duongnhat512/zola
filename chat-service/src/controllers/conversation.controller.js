const ConversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");
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
    console.log("req.body:", req.body);

    if (!req.body.created_by) {
      return res.status(400).json({
        status: "error",
        message: "Missing required field: created_by",
      });
    }

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

    const all_members = []
    for (const conversation of conversations) {
      const members = await ConversationModel.getAllUserInConversation(
        conversation.conversation_id
      );

      list_user_id = []

      for (const member of members) {
        if (member.user_id !== user_id) {
          list_user_id.push(member.user_id)
        }
      }

      const last_message_id = await ConversationModel.getLastMessage(
        conversation.conversation_id
      );

      let last_message = {}

      if (!last_message_id) {
        all_members.push({
          conversation_id: conversation.conversation_id,
          last_message: last_message,
          list_user_id,
        });
        continue;
      }else {
        console.log("last_message_id", last_message_id);
        last_message = await MessageModel.getMessageById(
          last_message_id
        );
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

ConversationController.getAllUserInConversation = async (req, res) => {
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

module.exports = ConversationController;
