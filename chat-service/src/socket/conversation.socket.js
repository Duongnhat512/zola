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
        try {
            await conversationController.createGroup(socket, data);
        } catch (error) {
            console.error("Lỗi khi tạo nhóm:", error);
            socket.emit("error", { message: "Lỗi khi tạo nhóm" });
        }
    });

    socket.on("add_member", async (data) => {
        console.log("Nhận yêu cầu thêm thành viên vào nhóm từ client:", data);
        try {
            await conversationController.addMember(socket, data);
        } catch (error) {
            console.error("Lỗi khi thêm thành viên vào nhóm:", error);
            socket.emit("error", { message: "Lỗi khi thêm thành viên vào nhóm" });
        }
    });

    socket.on("remove_member", async (data) => {
        console.log("Nhận yêu cầu xóa thành viên khỏi nhóm từ client:", data);
        try {
            await conversationController.removeMember(socket, data);
        } catch (error) {
            console.error("Lỗi khi xóa thành viên khỏi nhóm:", error);
            socket.emit("error", { message: "Lỗi khi xóa thành viên khỏi nhóm" });
        }
    });

    socket.on("get_conversations", async (data) => {
        console.log("Nhận yêu cầu lấy danh sách hội thoại từ client:", data);
        try {
            await conversationController.getConversations(socket, data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hội thoại:", error);
            socket.emit("error", { message: "Lỗi khi lấy danh sách hội thoại" });
        }
    });

    socket.on("set_conversation_permissions", async (data) => {
        console.log("Nhận yêu cầu thiết lập quyền hội thoại từ client:", data);
        try {
            await conversationController.setPermisstions(socket, data);
        } catch (error) {
            console.error("Lỗi khi thiết lập quyền hội thoại:", error);
            socket.emit("error", { message: "Lỗi khi thiết lập quyền hội thoại" });
        }
    });

    socket.on("set_permissions", async (data) => {
        console.log("Nhận yêu cầu thiết lập quyền từ client:", data);
        try {
            await conversationController.setPermisstions(socket, data);
        } catch (error) {
            console.error("Lỗi khi thiết lập quyền:", error);
            socket.emit("error", { message: "Lỗi khi thiết lập quyền" });
        }
    });

    socket.on("delete_conversation", async (data) => {
        console.log("Nhận yêu cầu xóa hội thoại từ client:", data);
        try {
            await conversationController.deleteConversation(socket, data);
        } catch (error) {
            console.error("Lỗi khi xóa hội thoại:", error);
            socket.emit("error", { message: "Lỗi khi xóa hội thoại" });
        }
    });

    socket.on("out_group", async (data) => {
        console.log("Nhận yêu cầu rời nhóm từ client:", data);
        try {
            await conversationController.outGroup(socket, data);
        } catch (error) {
            console.error("Lỗi khi rời nhóm:", error);
            socket.emit("error", { message: "Lỗi khi rời nhóm" });
        }
    })

    socket.on("update_group_avt", async (data) => {
        console.log("Nhận yêu cầu cập nhật nhóm từ client:", data);
        try {
            await conversationController.updateGroupAvt(socket, data);
        } catch (error) {
            console.error("Lỗi khi cập nhật nhóm:", error);
            socket.emit("error", { message: "Lỗi khi cập nhật nhóm" });
        }
    });

    socket.on("update_group_name", async (data) => {
        console.log("Nhận yêu cầu cập nhật tên nhóm từ client:", data);
        try {
            await conversationController.updateGroupName(socket, data);
        } catch (error) {
            console.error("Lỗi khi cập nhật tên nhóm:", error);
            socket.emit("error", { message: "Lỗi khi cập nhật tên nhóm" });
        }
    });

    socket.on("mark_as_read", async (data) => {
        console.log("Nhận yêu cầu đánh dấu đã đọc từ client:", data);
        try {
            await conversationController.markAsRead(socket, data);
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
            socket.emit("error", { message: "Lỗi khi đánh dấu đã đọc" });
        }
    });

    socket.on("clean_redis", async (data) => {
        console.log("Nhận yêu cầu xóa redis từ client:", data);
        try {
            await conversationController.clearUnread(socket, data);
        } catch (error) {
            console.error("Lỗi khi xóa redis:", error);
            socket.emit("error", { message: "Lỗi khi xóa redis" });
        }
    });
    socket.on("delete_history_for_me", async (data) => {
        // data: { user_id, conversation_id }
        console.log("Nhận yêu cầu xóa lịch sử hội thoại phía tôi:", data);
        try {
            await conversationController.deleteHistoryForUser(socket, data);
            socket.emit("delete_history_for_me_success", { message: "Đã xóa lịch sử hội thoại ở phía bạn" });
        } catch (error) {
            console.error("Lỗi khi xóa lịch sử hội thoại phía tôi:", error);
            socket.emit("error", { message: "Lỗi khi xóa lịch sử hội thoại phía tôi" });
        }
    });
};

module.exports = conversationSocket;