const app = require("./src/app");
require("dotenv").config();
const { connectDB } = require("./src/db/db");

// Connect to the database
connectDB();

// cart service will run on port 3002
app.listen(3002, () => {
  console.log("Cart server is running on port 3002");
});
