const { Server } = require("socket.io");
const axios = require("axios");
const messageController = require("../controllers/message.controller");
const conversationController = require("../controllers/conversation.controller");
const { isAuth } = require("../middlewares/auth.middleware");

const userSocketMap = new Map();

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

    socket.on("join_room", (data) => {
      console.log("Nhận yêu cầu join_room từ client:", data);
      conversationController.joinRoom(socket, data);
    });

    socket.on("leave_room", (data) => {
      conversationController.leaveRoom(socket, data);
    });

    socket.on("send_message", async (data) => {
      console.log("Received message data:", JSON.stringify(data));
      try {
        await messageController.sendMessage(socket, data);
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
      }
    });

    socket.on("get_messages", async (data) => {
      console.log("Received get_messages data:", JSON.stringify(data));
      try {
        await messageController.getMessages(socket, data);
      } catch (error) {
        console.error("Error handling get_messages:", error);
        socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
      }
    });

    

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}`);
      if (userSocketMap.get(socket.user.id) === socket.id) {
        userSocketMap.delete(socket.user.id);
        io.emit('user_offline', { userId: socket.user.id });
        console.log(`Emitted user_offline for UserID: ${socket.user.id}`);
      }
    });
  });
}

module.exports = { setupSocket };