const express = require("express");
const validator = require("../middlewares/validator");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// POST /auth/register
router.post(
  "/register",
  validator.registerUserValidation,
  authController.registerUser,
);
// POST /auth/login
router.post("/login", validator.loginUserValidation, authController.loginUser);
// GET /auth/me
router.get("/me", authMiddleware.authMiddleware, authController.getUserProfile);

// GET /auth/logout
router.get("/logout", authMiddleware.authMiddleware, authController.logoutUser);

// GET /auth/users/me/addresses
router.get(
  "/users/me/addresses",
  authMiddleware.authMiddleware,
  authController.getUserAddresses,
);

// POST /auth/users/me/addresses
router.post(
  "/users/me/addresses",
  authMiddleware.authMiddleware,
  validator.addUserAddressValidation,
  authController.addUserAddress,
);

// DELETE /auth/users/me/addresses/:addressId
router.delete(
  "/users/me/addresses/:addressId",
  authMiddleware.authMiddleware,
  authController.deleteUserAddress,
);

module.exports = router;
