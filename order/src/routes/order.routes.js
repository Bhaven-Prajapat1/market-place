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

module.exports = router;
