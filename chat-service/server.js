const http = require("http");
const app = require("./src/app");
require("dotenv").config();
const { setupSocket } = require("./src/configs/socket.config");

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});