const cookieParser = require("cookie-parser");
const express = require("express");
const cartRoute = require("./routes/cart.route");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/cart", cartRoute);

module.exports = app;
