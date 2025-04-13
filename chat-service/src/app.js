const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
}));
app.use(express.json());

app.use("/conversations", require("./routes/conversation.route"));
app.use("/messages", require("./routes/message.route"));

// Health check route
app.get("/", (req, res) => {
  res.send("Chat Service is running");
});

module.exports = app;
