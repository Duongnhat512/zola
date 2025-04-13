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
};

const serviceRoutes = {
  "/api/v1/auth-service": process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  "/api/v1/chat-service": process.env.CHAT_SERVICE_URL || "http://localhost:5002",
};

const {
  createProxyMiddleware, setupWebSocketProxy,
  createWebSocketProxyMiddleware
} = require("./src/middlewares/gateway.middleware");

app.use("/api/v1/auth-service", createProxyMiddleware(serviceRoutes["/api/v1/auth-service"]));

for (const [path, serviceUrl] of Object.entries(serviceRoutes)) {
  app.use(path, createWebSocketProxyMiddleware(path, serviceUrl));
  console.log(`Setup proxy for ${path} -> ${serviceUrl} (supports WebSocket)`);
}

// Health check
app.get("/", (req, res) => res.send("API Gateway is running..."));

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`API Gateway is running on port ${PORT}`));
