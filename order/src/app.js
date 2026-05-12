const express = require("express");
const orderRoutes = require("./routes/order.routes");
const cookiesParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookiesParser());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Order Service is running!" });
});
app.use("/api/orders", orderRoutes);

module.exports = app;
