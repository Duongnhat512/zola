const { Server } = require("socket.io");
const axios = require("axios");
const messageController = require("../controllers/message.controller");
const { isAuth } = require("../middlewares/auth.middleware");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"]
    },
    path: "/socket.io/",
    transports: ['websocket', 'polling']
  });

  io.use(isAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user}`);

    socket.on("send_message", async (data) => {
      console.log("Received message data:", JSON.stringify(data));
      try {
        await messageController.sendMessage(socket, data);
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
}

module.exports = { setupSocket };