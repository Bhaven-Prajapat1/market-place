const app = require("./src/app");
require("dotenv") .config();
const { connect } = require("./src/broker/broker");

const connectDB = require("./src/db/db");

connectDB();
connect();

app.listen(3003, () => {
  console.log("Order service is running on port 3003");
});
