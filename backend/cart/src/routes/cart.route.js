const express = require("express");
const cartModel = require("../models/cart.model");
const cartController = require("../controllers/cart.controller");
const validation = require("../middlewares/validation.middleware");
const AuthMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /api/cart
router.get(
  "/",
  AuthMiddleware.createAuthMiddleware(["user"]),
  cartController.getCart,
);

// POST /api/carts/items
router.post(
  "/items",
  validation.validateAddItemToCart,
  AuthMiddleware.createAuthMiddleware(["user"]),
  cartController.addItemToCart,
);

// PATCH /api/carts/items/:productId
router.patch(
  "/items/:productId",
  validation.validateUpdateCartItem,
  AuthMiddleware.createAuthMiddleware(["user"]),
  cartController.updateCartItem,
);

// DELETE /api/carts/items/:productId
router.delete(
  "/items/:productId",
  validation.validateDeleteCartItem,
  AuthMiddleware.createAuthMiddleware(["user"]),
  cartController.removeCartItem,
);

module.exports = router;
