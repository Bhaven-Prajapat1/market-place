const { body, validationResult } = require("express-validator");

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerUserValidation = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters long"),

  body("email").isEmail().withMessage("Invalid email format"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName.firstName")
    .isString()
    .withMessage("First name must be a string")
    .notEmpty()
    .withMessage("First name is required"),
  body("fullName.lastName")
    .isString()
    .withMessage("Last name must be a string")
    .notEmpty()
    .withMessage("Last name is required"),
  respondWithValidationErrors,
];

const loginUserValidation = [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  respondWithValidationErrors,
];

const addUserAddressValidation = [
  body("street").isString().withMessage("Street must be a string"),
  body("city").isString().withMessage("City must be a string"),
  body("state").isString().withMessage("State must be a string"),
  body("country").isString().withMessage("Country must be a string"),
  body("zip")
    .matches(/^\d{6}$/)
    .withMessage("Zip code must be a 6-digit number"),
  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be a 10-digit number"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean value"),
  respondWithValidationErrors,
];

module.exports = {
  registerUserValidation,
  loginUserValidation,
  addUserAddressValidation,
};
