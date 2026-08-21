const app = require("./src/app");
require("dotenv").config();
const { connectDB } = require("./src/db/db");

const PORT = process.env.PORT || 3002;

// Connect to the database
connectDB();

// cart service will run on port 3002
app.listen(PORT, () => {
  console.log(`Cart server is running on port ${PORT}`);
});
