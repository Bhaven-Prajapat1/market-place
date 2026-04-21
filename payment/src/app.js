const express = require('express');
const paymentRoutes = require('./routes/payment.route');
const cookiesParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookiesParser());
app.use('/api/payments', paymentRoutes);


module.exports = app;