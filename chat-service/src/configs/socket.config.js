const { Server } = require("socket.io");
const axios = require("axios");
const messageController = require("../controllers/message.controller");
const conversationController = require("../controllers/conversation.controller");
const { isAuth } = require("../middlewares/auth.middleware");

const userSocketMap = new Map();
const onlineUsers = new Set();

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"]
    },
    path: "/socket.io/",
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
    maxHttpBufferSize: 1e8 // 100MB max file size
  });

  io.use(isAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}, UserID: ${socket.user.id}`);

    // Lưu trữ kết nối user 
    userSocketMap.set(socket.user.id, socket.id);
    onlineUsers.add(socket.user.id);

    // Thông báo cho các user khác về user online
    io.emit('user_online', {
      userId: socket.user.id,
      username: socket.user.username
    });

    // socket.emit('online_users', Array.from(onlineUsers));

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

    // Gửi tin nhắn
    socket.on("send_message", async (data) => {
      console.log("Received message data:", JSON.stringify(data));
      try {
        const message = await messageController.sendMessage(socket, data);

        const roomClients = io.sockets.adapter.rooms.get(data.conversation_id);
        if (roomClients) {
          const receiptInfo = {
            message_id: message.message_id,
            readers: []
          };

          // Đánh dấu tất cả người dùng trong phòng đã nhận tin nhắn
          roomClients.forEach(clientId => {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket && clientSocket.user && clientSocket.user.id !== socket.user.id) {
              receiptInfo.readers.push(clientSocket.user.id);
            }
          });

          // Gửi thông tin đã nhận cho người gửi
          socket.emit('message_receipt', receiptInfo);
        }
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit('error', { message: "Lỗi xử lý tin nhắn", error: error.message });
      }
    });

    // Gửi hình ảnh
    socket.on("send_image", async (data) => {
      console.log("Received image data:", JSON.stringify(data));
      try {
        await messageController.sendImage(socket, data);
      } catch (error) {
        console.error("Error handling send_image:", error);
        socket.emit('error', { message: "Lỗi xử lý hình ảnh" });
      }
    });

    // Nhận tin nhắn
    socket.on("get_messages", async (data) => {
      console.log("Received get_messages data:", JSON.stringify(data));
      try {
        await messageController.getMessages(socket, data);
      } catch (error) {
        console.error("Error handling get_messages:", error);
        socket.emit('error', { message: "Lỗi xử lý tin nhắn" });
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.conversation_id).emit("user_typing", {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: data.isTyping
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}`);
      userSocketMap.delete(socket.user.id);
      io.emit('user_offline', { userId: socket.user.id });
      console.log(`Emitted user_offline for UserID: ${socket.user.id}`);
    });
  });
}

module.exports = { setupSocket };