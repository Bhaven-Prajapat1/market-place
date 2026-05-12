const mongoose = require("mongoose");
const axios = require("axios");
const orderModel = require("../models/order.model");
const { publishToQueue } = require("../broker/broker");

async function createOrder(req, res) {
  const user = req.user;
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  try {
    // fetch user cart from cart service
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (item) => {
        return (
          await axios.get(
            `http://localhost:3001/api/products/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        ).data.product;
      }),
    );

    let totalAmount = 0;

    const orderItems = cartResponse.data.cart.items.map((item, index) => {
      const product = products.find((p) => p._id === item.productId);

      // if note in stock does not allow order to be placed
      if (product.stock < item.quantity) {
        throw new Error(
          `Product ${product.title} is out of stock. Available quantity: ${product.stock}`,
        );
      }

      const itemTotal = product.price.amount * item.quantity;
      totalAmount += itemTotal;

      return {
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await orderModel.create({
      user: user.id,
      items: orderItems,
      status: "PENDING",
      totalPrice: {
        amount: totalAmount,
        currency: "INR",
      },
      shippingAddress: {
        street: req.body.shippingAddress.street,
        city: req.body.shippingAddress.city,
        state: req.body.shippingAddress.state,
        pincode: req.body.shippingAddress.pincode,
        country: req.body.shippingAddress.country,
      },
    });

    await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}
async function getUserOrders(req, res) {
  const user = req.user;

  try {
    const orders = await orderModel.find({ user: user.id });
    res.status(200).json({ orders });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}
async function getOrderById(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}
async function updateOrderAddress(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== user.id) {
      return res.status(403).json({ message: "Forbidden: Not your order" });
    }
    if (order.status !== "PENDING") {
      return res
        .status(409)
        .json({ message: "Cannot update address after payment is captured" });
    }

    order.shippingAddress = {
      street: req.body.shippingAddress.street,
      city: req.body.shippingAddress.city,
      state: req.body.shippingAddress.state,
      pincode: req.body.shippingAddress.pincode,
      country: req.body.shippingAddress.country,
    };

    await order.save();

    res.status(200).json({ message: "Shipping address updated", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}
async function cancelOrder(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== user.id) {
      return res.status(403).json({ message: "Forbidden: Not your order" });
    }
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return res
        .status(409)
        .json({ message: "Cannot cancel order at this stage" });
    }

    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderAddress,
  cancelOrder,
};
