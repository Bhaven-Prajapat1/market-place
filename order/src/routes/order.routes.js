const express = require("express");
const validationMiddleware = require("../middlewares/validation.middleware.js");
const { createAuthMiddleware } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.post(
  "/",
  validationMiddleware.createOrderValidation,
  createAuthMiddleware(["user"]),
  orderController.createOrder,
);

router.get(
  "/me",
  createAuthMiddleware(["user"]),
  orderController.getUserOrders,
);

router.get(
  "/:id",
  createAuthMiddleware(["user"]),
  orderController.getOrderById,
);

router.post(
  "/:id/cancel",
  createAuthMiddleware(["user"]),
  orderController.cancelOrder,
);

router.patch(
  "/:id/address",
  validationMiddleware.updateOrderAddressValidation,
  createAuthMiddleware(["user"]),
  orderController.updateOrderAddress,
);

module.exports = router;
