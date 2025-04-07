require("dotenv").config();
const app = require("./src/app");
const cors = require("cors");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
