const redisClient = require("../configs/redis.config");


const notifyNewMessage = async (socket, message, members, excludeId = null) => {
    try {
        const notificationPromises = members.map(async (memberId) => {
            if (memberId === excludeId) return;

            const socketIds = await redisClient.smembers(`sockets:${memberId}`);

            const emitPromises = socketIds.map(socketId => {
                return new Promise(resolve => {
                    socket.to(socketId).emit("new_message", message);
                    resolve();
                });
            });

            return Promise.all(emitPromises);
        });

        await Promise.all(notificationPromises);
    } catch (error) {
        console.error("Lỗi khi gửi thông báo tin nhắn mới:", error);
    }
}

const notifyMessageSent = async (socket, message) => {
    try {
        socket.emit("message_sent", message);
        const senderSockets = await redisClient.smembers(`sockets:${socket.user.id}`);
        const emitPromises = senderSockets.map(socketId => {
            return new Promise(resolve => {
                socket.to(socketId).emit("message_sent", message);
                resolve();
            });
        });
        await Promise.all(emitPromises);
    } catch (error) {
        console.error("Lỗi khi gửi thông báo tin nhắn đã gửi:", error);
    }
}

const notifySendMessageError = (socket, message) => {
    try {
        console.error("Error sending message:", message);
        socket.emit('error', {
            message: "Lỗi khi gửi tin nhắn",
            details: message
        });
        throw error;
    } catch (error) {
        console.error("Lỗi khi gửi thông báo tin nhắn đã gửi:", message);
    }
}

module.exports = {
    notifyNewMessage,
    notifyMessageSent,
    notifySendMessageError
}