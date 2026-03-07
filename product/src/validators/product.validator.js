const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Validation failed",
    errors: result.array({ onlyFirstError: true }),
  });
}

const createProductValidation = [
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("title is required")
    .bail()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("title must be 2-200 characters"),

  body("description")
    .exists({ checkFalsy: true })
    .withMessage("description is required")
    .bail()
    .isString()
    .withMessage("description must be a string")
    .bail()
    .trim()
    .isLength({ min: 4, max: 5000 })
    .withMessage("description must be 4-5000 characters"),

  body().custom((value, { req }) => {
    const rawAmount = req.body.priceAmount ?? req.body.amount;
    if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
      throw new Error("priceAmount (or amount) is required");
    }

    const asNumber = Number(rawAmount);
    if (Number.isNaN(asNumber)) {
      throw new Error("priceAmount must be a number");
    }

    if (asNumber <= 0) {
      throw new Error("priceAmount must be greater than 0");
    }

    return true;
  }),

  body(["priceCurrency", "currency"])
    .optional({ nullable: true })
    .isIn(["USD", "INR"])
    .withMessage("currency must be USD or INR"),
  handleValidationErrors,
];
const updateProductValidation = [
  body().custom((value, { req }) => {
    const hasAnyUpdatableField =
      req.body.title !== undefined ||
      req.body.description !== undefined ||
      req.body.priceAmount !== undefined ||
      req.body.priceCurrency !== undefined;

    if (!hasAnyUpdatableField) {
      throw new Error("At least one field is required");
    }

    return true;
  }),

  body("title")
    .optional()
    .isString()
    .withMessage("title must be a string")
    .bail()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("title must be 2-200 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .bail()
    .trim()
    .isLength({ min: 4, max: 5000 })
    .withMessage("description must be 4-5000 characters"),

  body("priceAmount")
    .optional()
    .custom((value) => {
      const asNumber = Number(value);

      if (Number.isNaN(asNumber)) {
        throw new Error("priceAmount must be a number");
      }

      if (asNumber <= 0) {
        throw new Error("priceAmount must be greater than 0");
      }

      return true;
    }),

  body("priceCurrency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("currency must be USD or INR"),

  handleValidationErrors,
];

module.exports = {
  createProductValidation,
  updateProductValidation,
};
 