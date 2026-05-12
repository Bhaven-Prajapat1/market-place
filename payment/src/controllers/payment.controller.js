const paymentModel = require("../models/payment.model");
const Razorpay = require("razorpay");
require("dotenv").config();
const axios = require("axios");
const { publishToQueue } = require("../broker/broker.js");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  try {
    const orderId = req.params.orderId;

    const orderResponse = await axios.get(
      `http://localhost:3003/api/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const price = orderResponse.data.order.totalPrice;

    const order = await razorpay.orders.create(price);

    console.log("Razorpay order created:", order);

    const payment = await paymentModel.create({
      order: orderId,
      razorpayOrderId: order.id,
      user: req.user.id,
      price: {
        amount: order.amount,
        currency: order.currency,
      },
    });

    await publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", payment);

    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", {
      email: req.user.email,
      orderId: orderId,
      paymentId: payment._id,
      amount: payment.price.amount,
      currency: payment.price.currency,
      fullName: req.user.username,
    });

    return res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (err) {
    console.log("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
}
async function verifyPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const {
      validatePaymentVerification,
    } = require("../../node_modules/razorpay/dist/utils/razorpay-utils.js");

    const isValid = validatePaymentVerification(
      {
        order_id: razorpayOrderId,
        payment_id: razorpayPaymentId,
      },
      signature,
      secret,
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const payment = await paymentModel.findOne({
      razorpayOrderId,
      status: "PENDING",
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.paymentId = razorpayPaymentId;
    payment.signature = signature;
    payment.status = "COMPLETED";
    await payment.save();

    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", {
      email: req.user.email,
      orderId: payment.order,
      paymentId: payment._id,
      amount: payment.price.amount,
      fullName: req.user.fullName,
    });

    await publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_VERIFIED", payment);

    res.status(200).json({ message: "Payment verified successfully" }, payment);
  } catch (err) {
    console.log("Error verifying payment:", err);

    await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", {
      email: req.user.email,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      fullName: req.user.fullName,
    });

    res.status(500).json({ error: "Failed to verify payment" });
  }
}
module.exports = {
  createPayment,
  verifyPayment,
};
