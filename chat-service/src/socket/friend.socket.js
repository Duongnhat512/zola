const FriendController = require("../controllers/friend.controller");

const friendSocket = (io, socket) => {
    // Gửi lời mời kết bạn
    socket.on("send_friend_request", async (data) => {
        console.log("Nhận yêu cầu gửi lời mời kết bạn từ client:", data);
        try {
         await FriendController.createFriendRequest(socket, data);
        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn:", error);
            socket.emit("error", { message: "Lỗi khi gửi lời mời kết bạn" });
        }
    });

    // Chấp nhận lời mời kết bạn
    socket.on("accept_friend_request", async (data) => {
        console.log("Nhận yêu cầu chấp nhận lời mời kết bạn từ client:", data);
        try {
            await FriendController.acceptFriendRequest(socket, data);
        } catch (error) {
            console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
            socket.emit("error", { message: "Lỗi khi chấp nhận lời mời kết bạn" });
        }
    });

    // Từ chối lời mời kết bạn
    socket.on("reject_friend_request", async (data) => {
        console.log("Nhận yêu cầu từ chối lời mời kết bạn từ client:", data);
        try {
            await FriendController.rejectFriendRequest(socket, data);
        } catch (error) {
            console.error("Lỗi khi từ chối lời mời kết bạn:", error);
            socket.emit("error", { message: "Lỗi khi từ chối lời mời kết bạn" });
        }
    });
    // Thu hồi lời mời 
    socket.on("cancel_friend_request", async (data) => {
        console.log("Nhận yêu cầu thu hồi lời mời kết bạn từ client:", data);
        try {
            await FriendController.deleteRequest(socket, data);
        } catch (error) {
            console.error("Lỗi khi thu hồi lời mời kết bạn:", error);
            socket.emit("error", { message: "Lỗi khi thu hồi lời mời kết bạn" });
        }
    });

    // Xóa bạn bè
    socket.on("delete_friend", async (data) => {
        console.log("Nhận yêu cầu xóa bạn bè từ client:", data);
        try {
            await FriendController.deleteFriend(socket, data);
        } catch (error) {
            console.error("Lỗi khi xóa bạn bè:", error);
            socket.emit("error", { message: "Lỗi khi xóa bạn bè" });
        }
    });

}
module.exports = friendSocket;