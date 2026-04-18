const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const createOrderValidation = [
  
  body("shippingAddress.street")
    .isString()
    .withMessage("Street must be a string"),

  body("shippingAddress.city")
    .isString()
    .withMessage("City must be a string"),

  body("shippingAddress.state")
    .isString()
    .withMessage("State must be a string"),

  body("shippingAddress.country")
    .isString()
    .withMessage("Country must be a string"),

  body("shippingAddress.pincode")
    .matches(/^\d{6}$/)
    .withMessage("Pin code must be a 6-digit number"),
  validateResult,
];

module.exports = {
  createOrderValidation,
};
