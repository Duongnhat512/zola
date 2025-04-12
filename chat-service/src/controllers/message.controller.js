const MessageModel = require('../models/message.model.js')
const MessageController = {}

MessageController.getMessages = async (socket, data) => {
    try {
        const messages = await MessageModel.getMessages(data.conversation_id)
        socket.emit('get_messages', messages)
    } catch (error) {
        console.error("Lỗi khi nhận tin nhắn:", error)
        socket.emit('error', { message: "Lỗi khi nhận tin nhắn" })
    }
}

MessageController.sendMessage = async (socket, data) => {
    try {
        const savedMessage = await MessageModel.sendMessage(data)
        socket.emit('message_sent', savedMessage)
        socket.to(data.conversation_id).emit("new_message", savedMessage);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error)
        socket.emit('error', { message: "Lỗi khi gửi tin nhắn" })
    }
}

MessageController.sendImage = async (socket, data) => {
    try {
        const savedMessage = await MessageModel.sendImage(data)
        socket.emit('image_sent', savedMessage)
        socket.to(data.conversation_id).emit("new_image", savedMessage);
    } catch (error) {
        console.error("Lỗi khi gửi hình ảnh:", error)
        socket.emit('error', { message: "Lỗi khi gửi hình ảnh" })
    }
}

MessageController.deleteMessage = async (socket, data) => {
    try {
        const result = await MessageModel.deleteMessage(data.message_id)
        socket.emit('message_deleted', result)
        socket.broadcast.emit('message_deleted', result)
    } catch (error) {
        console.error("Lỗi khi xóa tin nhắn:", error)
        socket.emit('error', { message: "Lỗi khi xóa tin nhắn" })
    }
}

MessageController.updateMessage = async (socket, data) => {
    try {
        const message = await MessageModel.updateMessage(data.message_id, data.message)
        socket.emit('message_updated', message)
        socket.broadcast.emit('message_updated', message)
    } catch (error) {
        console.error("Lỗi khi cập nhật tin nhắn:", error)
        socket.emit('error', { message: "Lỗi khi cập nhật tin nhắn" })
    }
}

module.exports = MessageController