const express = require("express");
const validationMiddleware = require("../middlewares/validation.middleware.js");
const { createAuthMiddleware } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

// POST api/orders - create order from current cart
router.post(
  "/",
  validationMiddleware.createOrderValidation,
  createAuthMiddleware(["user"]),
  orderController.createOrder,
);

// GET ORDERS for logged in user api/orders/me
router.get(
  "/me",
  createAuthMiddleware(["user"]),
  orderController.getUserOrders,
);

// GET ORDERS by id api/orders/:id
router.get(
  "/:id",
  createAuthMiddleware(["user", "admin"]),
  orderController.getOrderById,
);

// POST cancel order - only if order is still pending
router.post(
  "/:id/cancel",
  createAuthMiddleware(["user"]),
  orderController.cancelOrder,
);

// PATCH update order address - only if order is still pending
router.patch(
  "/:id/address",
  validationMiddleware.updateOrderAddressValidation,
  createAuthMiddleware(["user"]),
  orderController.updateOrderAddress,
);

module.exports = router;
