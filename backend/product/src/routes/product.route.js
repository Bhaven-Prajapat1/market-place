const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const { createAuthMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const productController = require("../controllers/product.controller");
const { createProductValidation, updateProductValidation } = require("../validators/product.validator");

const router = express.Router();

// GET /api/products
router.get("/", productController.getProducts);

// POST /api/products
router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidation,
  productController.createProduct,
);

// PATCH /api/products/:id
router.patch(
  "/:id",
  createAuthMiddleware(["seller"]),
  updateProductValidation,
  productController.updateProduct,
);

// DELETE /api/products/:id
router.delete("/:id", createAuthMiddleware(["seller"]), productController.deleteProduct);

// GET /api/products/seller
router.get("/seller", createAuthMiddleware(["seller"]), productController.getProductsBySeller);

// GET /api/products/:id
router.get("/:id", productController.getProductById);

module.exports = router;
