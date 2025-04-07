require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Địa chỉ của API Gateway
    credentials: true, // Cho phép cookie được gửi từ client
  })
);
app.use(express.json());

// Service URL
const services = {
  authService: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  chatService: process.env.CHAT_SERVICE_URL || "http://localhost:5002",
};

// Proxy Middleware
const {
  createProxyMiddleware,
} = require("./src/middlewares/gateway.middleware");

// ✅ Route Proxy
app.use("/api/v1/auth-service", createProxyMiddleware(services.authService));
app.use("/api/v1/chat", createProxyMiddleware(services.chatService));

// Health check
app.get("/", (req, res) => res.send("API Gateway is running..."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway is running on port ${PORT}`));
