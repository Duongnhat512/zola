const { Server } = require("socket.io");
const { isAuth } = require("../middlewares/auth.middleware");
const messageSocket = require("../socket/message.socket");
const conversationSocket = require("../socket/conversation.socket");
const redisClient = require("./redis.config");

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
    
    const userId = socket.user.id;

    await redisClient.sadd(`sockets:${userId}`, socket.id);

    io.emit('user_online', {
      userId: socket.user.id,
      username: socket.user.username
    });

    messageSocket(io, socket);
    conversationSocket(io, socket);

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}`);

      await redisClient.srem(`sockets:${userId}`, socket.id);

      io.emit('user_offline', { userId: socket.user.id });
    });
  });
}

module.exports = { setupSocket };