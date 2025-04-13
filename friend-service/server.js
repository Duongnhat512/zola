const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(`Friend Service running on port ${PORT}`);
});
