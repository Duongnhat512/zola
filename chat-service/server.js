const http = require("http");
const app = require("./src/app");
require("dotenv").config();
const { setupSocket } = require("./src/configs/socket.config");
const { cleanUpRedis } = require("./src/utils/redis.helper");

const server = http.createServer(app);
setupSocket(server);

// Xóa user khỏi Redis khi restart app
cleanUpRedis();

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});