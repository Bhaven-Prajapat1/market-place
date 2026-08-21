require("dotenv").config();
const app = require("./src/app");

const listener = require("./src/broker/listener");
const connectDB = require("./src/db/db");
const { connect } = require("./src/broker/broker");

const PORT = process.env.PORT || 3007;

connectDB();

connect().then(() => {
  listener();
});

app.listen(PORT, () => {
  console.log(`Seller server is running on port ${PORT}`);
});
