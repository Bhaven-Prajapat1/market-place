const app = require("./src/app");
require("dotenv").config();
const { connect } = require("./src/broker/broker");

const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 3003;

connectDB();
connect();

app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});
