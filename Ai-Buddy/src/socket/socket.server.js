const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user info to socket object
      next(); 
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
  });
}

module.exports = { initSocketServer };
