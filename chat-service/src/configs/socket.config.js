const { Server } = require("socket.io");
const axios = require("axios");
const messageController = require("../controllers/message.controller");
const conversationController = require("../controllers/conversation.controller");
const { isAuth } = require("../middlewares/auth.middleware");
const { addUser, removeUser } = require("../utils/online.helper");

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

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.user.username}, UserID: ${socket.user.id}`);

    try {
      await axios.put(`${process.env.BASE_URL}/auth-service/me/update-status`,
        {
          id: socket.user.id,
          status: "Online"
        },
        {
          headers: {
            Authorization: `Bearer ${socket.handshake.headers.authorization}`
          }
        }
      );
    } catch (error) {
      console.error("Error updating user status to online:", error.message);
    }

    addUser(socket.user.id, socket.id);

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

    // Gửi file
    socket.on("send_file", async (data) => {
      console.log(`Received file upload request from ${socket.user.username}`);
      try {
        // Xử lý giới hạn kích thước file nếu cần
        if (data.file_size && data.file_size > 50 * 1024 * 1024) { // 50MB
          return socket.emit('error', { message: "File quá lớn, vui lòng upload file nhỏ hơn 5MB" });
        }

        await messageController.sendFile(socket, data);
      } catch (error) {
        console.error("Error handling send_file:", error);
        socket.emit('error', { message: "Lỗi khi gửi file" });
      }
    });

    // Gửi file private khi chưa tạo conversation
    socket.on("send_private_file", async (data) => {
      console.log(`Received private file from ${socket.user.username} to ${data.receiver_id}`);
      try {
        const fileMessage = await messageController.sendPrivateFile(socket, {
          ...data,
          conversation_id: data.conversation_id || null
        });

        if (!data.conversation_id) {
          await messageController.sendPrivateMessage(socket, {
            receiver_id: data.receiver_id,
            type: "file",
            message: `Đã gửi file: ${data.file_name}`,
            media: fileMessage.file_url,
            file_data: null // Không gửi lại file data
          });
        }
      } catch (error) {
        console.error("Error handling private file:", error);
        socket.emit('error', { message: "Lỗi khi gửi file" });
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

    socket.on("send_private_message", async (data) => {
      console.log("Received first message data:", JSON.stringify(data));
      try {
        await messageController.sendPrivateMessage(socket, data);
      } catch (error) {
        console.error("Error handling first message:", error);
        socket.emit('error', { message: "Lỗi khi gửi tin nhắn đầu tiên" });
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.conversation_id).emit("user_typing", {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping: data.isTyping
      });
    });

    socket.on("delete_message", async (data) => {
      console.log("Received delete_message data:", JSON.stringify(data));
      try {
        await messageController.deleteMessage(socket, data);
      } catch (error) {
        console.error("Error handling delete_message:", error);
        socket.emit('error', { message: "Lỗi xử lý xóa tin nhắn" });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}`);
      removeUser(socket.user.id, socket.id);
      io.emit('user_offline', { userId: socket.user.id });
      console.log(`Emitted user_offline for UserID: ${socket.user.id}`);

      try {
        await axios.put(`${process.env.BASE_URL}/auth-service/me/update-status`,
          {
            id: socket.user.id,
            status: "Offline"
          },
          {
            headers: {
              Authorization: `Bearer ${socket.handshake.headers.authorization}`
            }
          }
        );
      } catch (error) {
        console.error("Error updating user status to offline:", error.message);
      }
    });
  });
}

module.exports = { setupSocket };