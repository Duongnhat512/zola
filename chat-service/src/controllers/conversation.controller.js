const ConversationModel = require('../models/conversation.model');
const ConversationController = {};

ConversationController.create = async (req, res) => {
    try {
        const conversation = await ConversationModel.createConversation(req.body);
        res.status(201).json({ status: "success", message: "Tạo hội thoại thành công", conversation });
    } catch (error) {
        console.error("Có lỗi khi tạo hội thoại:", error);
        res.status(500).json({ message: "Có lỗi khi tạo hội thoại" });
    }
}

ConversationController.get = async (req, res) => {
    const { user_id } = req.body;
    try {
        const conversations = await ConversationModel.getConversations(user_id);
        res.status(200).json({ status: "success", message: "Lấy danh sách hội thoại thành công", conversations });
    } catch (error) {
        console.error("Có lỗi khi lấy danh sách hội thoại:", error);
        res.status(500).json({ message: "Có lỗi khi lấy danh sách hội thoại" });
    }
}

ConversationController.delete = async (req, res) => {
    try {
        const result = await ConversationModel.deleteConversation(req.params.id);
        res.status(200).json({ status: "success", message: "Xóa thành công" });
    } catch (error) {
        console.error("Có lỗi khi xóa hội thoại:", error);
        res.status(500).json({ message: "Có lỗi khi xóa hội thoại" });
    }
}

ConversationController.update = async (req, res) => {
    try {
        const updatedConversation = await ConversationModel.updateConversation(req.params.id, req.body);
        res.status(200).json({ status: "success", updatedConversation });
    } catch (error) {
        console.error("Có lỗi khi cập nhật hội thoại:", error);
        res.status(500).json({ message: "Có lỗi khi cập nhật hội thoại" });
    }
}

module.exports = ConversationController;