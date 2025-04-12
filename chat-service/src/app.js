const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/conversations", require("./routes/conversation.route"));

// Health check route
app.get("/", (req, res) => {
  res.send("Chat Service is running");
});

module.exports = app;
