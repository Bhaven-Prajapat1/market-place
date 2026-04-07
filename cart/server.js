const { config } = require("dotenv");
require("dotenv").config();
const connectDB = require("./src/db/db");
const app = require("./src/app");

connectDB();

app.listen(3002, () => {
  console.log("Cart service is running on port 3002");
});
