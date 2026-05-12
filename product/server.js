require("dotenv").config();
const { connect } = require('./src/broker/broker');
const app = require("./src/app");
const connectDb = require("./src/db/db");

connectDb();

connect();

app.listen(3001, () => {
  console.log("Product service is running on port 3001");
});
