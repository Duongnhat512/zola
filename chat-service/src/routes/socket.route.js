const messageController = require("../controllers/message.controller");

module.exports = socketRoutes = (socket) => {
    socket.on("send_message", async (data) => {
        await messageController.sendMessage(socket, data);
    });

    socket.on("get_messages", async (data) => {
        await messageController.getMessages(socket, data);
    });
};