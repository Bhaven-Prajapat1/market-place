const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.route");
const { connect } = require("./broker/broker");

const app = express();

connect();

// middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Auth Service is running!" });
});

app.use("/api/auth", authRouter);

module.exports = app;
