const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  let token = req.cookies.token;

  // Also support Authorization header (Bearer token)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
    //Agar token abhi tak nahi mila
    // Aur request ke header me "Authorization" hai
    // Aur wo "Bearer " se start ho raha hai
    // To usme se actual token nikal lo.
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally, fetch user from DB if needed
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };
