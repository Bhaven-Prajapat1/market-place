const app = require("./src/app");
require("dotenv").config();
const { initSocketServer } = require("./src/socket/socket.server");

const http = require("http");

const PORT = process.env.PORT || 3005;
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Ai buddy is running on port ${PORT}`);
});


