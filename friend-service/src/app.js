const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", require("./routes/friend.route"));

// Health check route
app.get("/", (req, res) => {
  res.send("Friend Service is running");
});

module.exports = app;
