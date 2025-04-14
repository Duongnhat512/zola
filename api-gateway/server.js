require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "exp://192.168.2.5:8081"], // Địa chỉ của client
    credentials: true, // Cho phép cookie được gửi từ client
  })
);
app.use(express.json());

// Service URL
const services = {
  authService: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  chatService: process.env.CHAT_SERVICE_URL || "http://localhost:5002",
  friendService: process.env.FRIEND_SERVICE_URL || "http://localhost:5003",
};

const serviceRoutes = {
  "/api/v1/auth-service":
    process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  "/api/v1/chat-service":
    process.env.CHAT_SERVICE_URL || "http://localhost:5002",
  "/api/v1/friend-service":
    process.env.FRIEND_SERVICE_URL || "http://localhost:5003",
};

const {
  createProxyMiddleware,
  setupWebSocketProxy,
} = require("./src/middlewares/gateway.middleware");

app.use(
  "/api/v1/auth-service",
  createProxyMiddleware(services.authService)
);
app.use(
  "/api/v1/friend-service",
  createProxyMiddleware(services.friendService)
);
app.use(
  "/api/v1/chat-service",
  createProxyMiddleware(services.chatService)
);

const socketProxy = setupWebSocketProxy(server, '/socket.io', services.chatService);
app.use('/socket.io', socketProxy);

// Health check
app.get("/", (req, res) => res.send("API Gateway is running..."));

const PORT = process.env.PORT || 8888;
server.listen(PORT, () =>
  console.log(`API Gateway is running on port ${PORT}`)
);
