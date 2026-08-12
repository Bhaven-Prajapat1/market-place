const express = require("express");
const { connect, subscribeToQueue } = require("./broker/broker");
const setLisnteners = require("./broker/listeners");

const app = express();

connect().then(() => {
  setLisnteners();
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Notification Service is running!" });
});

module.exports = app;
