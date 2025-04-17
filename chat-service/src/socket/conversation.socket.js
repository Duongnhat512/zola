const conversationController = require("../controllers/conversation.controller");

const conversationSocket = (io, socket) => {
    // Tham gia phòng chat
    socket.on("join_room", (data) => {
        console.log("Nhận yêu cầu join_room từ client:", data);
        conversationController.joinRoom(socket, data);

        const clients = io.sockets.adapter.rooms.get(data.conversation_id);
        const users = [];
        if (clients) {
            clients.forEach(clientId => {
                const clientSocket = io.sockets.sockets.get(clientId);
                if (clientSocket && clientSocket.user) {
                    users.push({
                        userId: clientSocket.user.id,
                        username: clientSocket.user.username
                    });
                }
            });
        }
        io.to(data.conversation_id).emit('room_users', users);
    });

    // Rời phòng chat
    socket.on("leave_room", (data) => {
        conversationController.leaveRoom(socket, data);
    });

    socket.on("create_group", async (data) => {
        console.log("Nhận yêu cầu tạo nhóm từ client:", data);
        
        try{
            await conversationController.createGroup(socket, data);
            socket.join(data.conversation_id);
        } catch (error) {
            console.error("Lỗi khi tạo nhóm:", error);
            socket.emit("error", { message: "Lỗi khi tạo nhóm" });
        }
    });
};

module.exports = conversationSocket;