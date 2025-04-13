import { io } from "socket.io-client";

// const token = localStorage.getItem("accessToken")
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJuYW1lIjoiYWRtaW4ifSwiaWF0IjoxNzQ0NTYwMDMyLCJleHAiOjE3NDQ1NjA5MzJ9.JFhrYjL50wBsa6jO50ichILe1xzNYl2aXavPT2WSPkM"
const socket = io("http://localhost:5002", {
  transports: ["websocket"],
  extraHeaders: {
    authorization: token, // Header giống như Postman
  },
});

console.log(socket);

export default socket;
