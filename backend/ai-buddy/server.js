const app = require("./src/app");
require("dotenv").config();
const { initSocketServer } = require("./src/socket/socket.server");

const http = require("http");

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(3005, () => {
  console.log("Ai buddy is running on port 3005");
});


