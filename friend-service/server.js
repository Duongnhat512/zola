const http = require("http");
const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
