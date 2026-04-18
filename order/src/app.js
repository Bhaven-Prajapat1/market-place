const express = require("express");
const orderRoutes = require("./routes/order.routes");
const cookiesParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookiesParser());
app.use("/api/orders", orderRoutes);

module.exports = app;
