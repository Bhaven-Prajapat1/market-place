const { body, validationResult, param } = require("express-validator");
const mongoose = require("mongoose");
// const { param } = require("../app");

function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateAddItemToCart = [
  // Tests/clients may send `qty` instead of `quantity`.
  (req, _res, next) => {
    if (req.body?.quantity === undefined && req.body?.qty !== undefined) {
      req.body.quantity = req.body.qty;
    }
    next();
  },
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Product ID format"),

  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
  validateResult,
];

const validateUpdateCartItem = [
  // Allow qty/quantity in body
  (req, _res, next) => {
    if (req.body?.quantity === undefined && req.body?.qty !== undefined) {
      req.body.quantity = req.body.qty;
    }
    next();
  },

  // Validate productId from URL param, not body
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Product ID format"),

  // Validate quantity from body
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),

  validateResult,
];

module.exports = {
  validateAddItemToCart,
  validateUpdateCartItem,
};
