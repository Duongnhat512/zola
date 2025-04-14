const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

// Middleware để parse body
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Log request để debug
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Body:`, req.body);
  next();
});

// Routes
app.use("/conversations", require("./routes/conversation.route"));
app.use("/messages", require("./routes/message.route"));

// Health check route
app.get("/", (req, res) => {
  res.send("Chat Service is running");
});

module.exports = app;
