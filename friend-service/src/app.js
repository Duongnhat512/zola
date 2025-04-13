const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "exp://192.168.2.5:8081"], // Địa chỉ của client
    credentials: true, // Cho phép cookie được gửi từ client
  })
);
app.use(express.json()); // để đọc JSON body

app.use("/friends", require("./routes/friend.route"));

// Health check route
app.get("/", (req, res) => {
  res.send("Friend Service is running");
});

module.exports = app;
