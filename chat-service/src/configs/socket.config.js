const { Server } = require("socket.io");
const axios = require("axios");
const messageController = require("../controllers/message.controller");
const { isAuth } = require("../middlewares/auth.middleware");

function setupSocket(server) {
  const io = new Server(server, {
    cors: { 
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true 
    },
    path: "/socket.io/", // Xác nhận path đúng
    transports: ['websocket', 'polling']
  });

  // io.use(isAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.on("send_message", async (data) => {
      await messageController.sendMessage(socket, data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
}

module.exports = { setupSocket };