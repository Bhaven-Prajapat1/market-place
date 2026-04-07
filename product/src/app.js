const express = require('express');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/product.route');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/products", productRoutes);

app.use((err, req, res, next) => {
	void next;
	console.error(err);
	res.status(500).json({ message: "Internal server error" });
});

module.exports = app; 