import { io } from "socket.io-client";

const token = localStorage.getItem("accessToken");
const socket = io("http://localhost:5002", {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: `${token}`,
      },
    },
  },
});

console.log(socket);

export default socket;
