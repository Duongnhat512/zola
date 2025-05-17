const redisClient = require("../configs/redis.config")
const CallModel = require("../models/call.model")
const { notifyToAllMembers } = require("../services/socket.service")

const CallController = {};

CallController.initiateCall = async (socket, data) => {
    const { conversation_id, call_type } = data;
    const initiator_id = socket.user.id;

    if (!conversation_id) {
        socket.emit("error", { message: "Thiếu conversation_id" });
        return;
    }

    try {
        const members = await redisClient.smembers(`group:${conversation_id}`);
        if (!members || members.length === 0) {
            socket.emit("error", { message: "Không tìm thấy thành viên nào trong cuộc gọi" });
            return;
        }

        const activeCalls = await CallModel.getActiveCallsByConversationId(conversation_id);
        if (activeCalls && activeCalls.length > 0) {
            socket.emit("error", { message: "Cuộc gọi đã được khởi tạo trước đó" });
            return;
        }

        const callData = {
            conversation_id,
            initiator_id,
            participants: members,
            type: call_type || "video",
        }

        const call = await CallModel.createCall(callData);

        socket.emit("call_initiated", {
            call_id: call.id,
            conversation_id,
            participants: call.participants,
            status: 'initiating',
            type: call.type
        });

        await notifyToAllMembers(socket, members, "incoming_call", {
            call_id: call.id,
            conversation_id,
            initiator_id,
            status: 'ringing',
            type: call.type
        });

        return call;

    } catch (error) {
        console.error("Error initiating call:", error);
        socket.emit("error", { message: "Lỗi khi khởi tạo cuộc gọi" });
    }
}

CallController.acceptCall = async (socket, data) => {
    const { call_id } = data;
    const user_id = socket.user.id;

    if (!call_id) {
        socket.emit("error", { message: "Thiếu call_id" });
        return;
    }

    try {
        const call = await CallModel.getCallById(call_id);
        if (!call) {
            socket.emit("error", { message: "Cuộc gọi không tồn tại" });
            return;
        }

        if (call.status == "ended") {
            return socket.emit("error", { message: "Cuộc gọi đã kết thúc" });
        }

        const participants = call.participants;

        if (!call.participants.includes(user_id)) {
            return socket.emit("error", { message: "Bạn không phải là thành viên của cuộc gọi" });
        }

        await CallModel.updateCallStatus(call_id, "active");

        socket.emit("call_accepted", {
            call_id,
            conversation_id: call.conversation_id,
            initiator_id: call.initiator_id,
            status: 'active',
            type: call.type
        });

        await notifyToAllMembers(socket, call.participants, "participant_joined", {
            call_id,
            user_id,
            participants
        });

        return call;

    } catch (error) {
        console.error("Error accepting call:", error);
        socket.emit("error", { message: "Lỗi khi chấp nhận cuộc gọi" });
    }
}

CallController.rejectCall = async (socket, data) => {
    const { call_id } = data;
    const user_id = socket.user.id;

    if (!call_id) {
        socket.emit("error", { message: "Thiếu call_id" });
        return;
    }

    try {
        const call = await CallModel.getCallById(call_id);
        if (!call) {
            return socket.emit("error", { message: "Cuộc gọi không tồn tại" });
        }

        if (call.status == "ended") {
            return socket.emit("error", { message: "Cuộc gọi đã kết thúc" });
        }

        if (call.initiator_id == user_id) {
            return socket.emit("error", { message: "Bạn không thể từ chối cuộc gọi" });
        }

        if (!call.participants.includes(user_id)) {
            return socket.emit("error", { message: "Bạn không phải là thành viên của cuộc gọi" });
        }

        await CallModel.updateCallStatus(call_id, "ended");

        const initiatorSocketIds = await redisClient.smembers(`sockets:${call.initiator_id}`);
        for (const socketId of initiatorSocketIds) {
            socket.to(socketId).emit("call_rejected", {
                call_id,
                user_id,
                message: "Người dùng đã từ chối cuộc gọi"
            });
        }

        socket.emit("call_rejected_confirmation", { call_id });

        // await notifyToAllMembers(socket, call.participants, "call_ended", {
        //     call_id,
        //     conversation_id: call.conversation_id,
        //     initiator_id: call.initiator_id,
        //     status: 'ended',
        //     type: call.type
        // });

        return call;
    } catch (error) {
        console.error("Error rejecting call:", error);
        socket.emit("error", { message: "Lỗi khi từ chối cuộc gọi" });
    }
}


CallController.endCall = async (socket, data) => {
    const { call_id } = data;
    const user_id = socket.user.id;

    if (!call_id) {
        socket.emit("error", { message: "Thiếu call_id" });
        return;
    }

    try {
        const call = await CallModel.getCallById(call_id);
        if (!call) {
            return socket.emit("error", { message: "Cuộc gọi không tồn tại" });
        }

        if (call.status == "ended") {
            return socket.emit("error", { message: "Cuộc gọi đã kết thúc" });
        }

        if (!call.participants.includes(user_id)) {
            return socket.emit("error", { message: "Bạn không phải là thành viên của cuộc gọi" });
        }

        await CallModel.updateCallStatus(call_id, "ended");
        
        socket.emit("call_ended", {
            call_id,
            conversation_id: call.conversation_id,
            initiator_id: call.initiator_id,
            status: 'ended',
            type: call.type
        });

        await notifyToAllMembers(socket, call.participants, "call_ended", {
            call_id,
            conversation_id: call.conversation_id,
            initiator_id: call.initiator_id,
            status: 'ended',
            type: call.type
        });
        
    
        return call;
    
    } catch (error) {
        console.error("Error ending call:", error);
        socket.emit("error", { message: "Lỗi khi kết thúc cuộc gọi" });
    }
}

module.exports = CallController;