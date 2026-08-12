require("dotenv").config();
const { connect } = require("./src/broker/broker");
const { connectRedis } = require("./src/cache/redis");
const app = require("./src/app");
const connectDb = require("./src/db/db");

async function startServer() {
  try {
    await connectDb();
    await connect();
    await connectRedis();

    app.listen(3001, () => {
      console.log("Product service is running on port 3001");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
