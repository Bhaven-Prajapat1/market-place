const app = require("./src/app");
require("dotenv").config();
const http = require("http");
const { initSocketServer } = require("./src/socket/socket.server");

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(3005, () => {
  console.log("Ai BuddyService is running on port 3005");
});
