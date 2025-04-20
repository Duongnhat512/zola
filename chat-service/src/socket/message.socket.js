const messageController = require("../controllers/message.controller");

const messageSocket = (io, socket) => {
    // Gửi tin nhắn nhóm
    socket.on("send_group_message", async (data) => {
        console.log("Received message data:", JSON.stringify(data));
        try {
            await messageController.sendGroupMessage(socket, data);
        } catch (error) {
            console.error("Error handling send_group_message:", error);
            socket.emit('error', { message: "Lỗi khi gửi tin nhắn nhóm" });
        }
    });
    
    // Nhận tin nhắn
    socket.on("get_messages", async (data) => {
        console.log("Received get_messages data:", JSON.stringify(data));
        try {
            await messageController.getMessages(socket, data);
        } catch (error) {
            console.error("Error handling get_messages:", error);
            socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
        }
    });

    socket.on("send_private_message", async (data) => {
        console.log("Received first message data:", JSON.stringify(data));
        try {
            await messageController.sendPrivateMessage(socket, data);
        } catch (error) {
            console.error("Error handling first message:", error);
            socket.emit('error', { message: "Lỗi khi gửi tin nhắn đầu tiên" });
        }
    });

    // Xóa tin nhắn
    socket.on("delete_message", async (data) => {
        console.log("Received delete_message data:", JSON.stringify(data));
        try {
            await messageController.deleteMessage(socket, data);
        } catch (error) {
            console.error("Error handling delete_message:", error);
            socket.emit('error', { message: "Lỗi xử lý xóa tin nhắn" });
        }
    });

    // Ẩn tin nhắn 1 phía
    socket.on("set_hidden_message", async (data) => {
        console.log("Received set_hidden_message data:", JSON.stringify(data));
        try {
            await messageController.setHiddenMessage(socket, data);
        } catch (error) {
            console.error("Error handling set_hidden_message:", error);
            socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
        }
    });

    // Sự kiện đang nhập tin nhắn 
    socket.on("typing", (data) => {
        socket.to(data.conversation_id).emit("user_typing", {
            userId: socket.user.id,
            username: socket.user.username,
            isTyping: data.isTyping
        });
    });

    // Ngừng nhập tin nhắn
    socket.on("stop_typing", (data) => {
        socket.to(data.conversation_id).emit("user_stop_typing", {
            userId: socket.user.id,
            username: socket.user.username,
            isTyping: data.isTyping
        });
    });

};

module.exports = messageSocket;