const callController = require("../controllers/call.controller");

const callSocket = (io, socket) => {
    // Khởi tạo cuộc gọi
    socket.on("initiate_call", async (data) => {
        console.log("Nhận yêu cầu khởi tạo cuộc gọi từ client:", data);
        try {
            await callController.initiateCall(socket, data);
        } catch (error) {
            console.error("Lỗi khi khởi tạo cuộc gọi:", error);
            socket.emit("error", { message: "Lỗi khi khởi tạo cuộc gọi" });
        }
    });

    // Chấp nhận cuộc gọi
    socket.on("accept_call", async (data) => {
        console.log("Nhận yêu cầu chấp nhận cuộc gọi từ client:", data);
        try {
            await callController.acceptCall(socket, data);
        } catch (error) {
            console.error("Lỗi khi chấp nhận cuộc gọi:", error);
            socket.emit("error", { message: "Lỗi khi chấp nhận cuộc gọi" });
        }
    });

    // Từ chối cuộc gọi
    socket.on("reject_call", async (data) => {
        console.log("Nhận yêu cầu từ chối cuộc gọi từ client:", data);
        try {
            await callController.rejectCall(socket, data);
        } catch (error) {
            console.error("Lỗi khi từ chối cuộc gọi:", error);
            socket.emit("error", { message: "Lỗi khi từ chối cuộc gọi" });
        }
    });

    // Kết thúc cuộc gọi
    socket.on("end_call", async (data) => {
        console.log("Nhận yêu cầu kết thúc cuộc gọi từ client:", data);
        try {
            await callController.endCall(socket, data);
        } catch (error) {
            console.error("Lỗi khi kết thúc cuộc gọi:", error);
            socket.emit("error", { message: "Lỗi khi kết thúc cuộc gọi" });
        }
    });

    // Rời cuộc gọi (nhưng không kết thúc)
    // socket.on("leave_call", async (data) => {
    //     try {
    //         await callController.leaveCall(socket, data);
    //     } catch (error) {
    //         console.error("Lỗi khi rời cuộc gọi:", error);
    //         socket.emit("error", { message: "Lỗi khi rời cuộc gọi" });
    //     }
    // });
};

module.exports = callSocket;