const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { publishToQueue } = require("../broker/broker");
const redis = require("../db/redis");

// POST /auth/register
const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    fullName: { firstName, lastName },
    addresses,
    role,
  } = req.body;

  const userAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (userAlreadyExists) {
    return res
      .status(400)
      .json({ message: "User with this email or username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    username,
    email,
    password: hashedPassword,
    fullName: {
      firstName,
      lastName,
    },
    addresses,
    role,
  });

  await Promise.all([
    publishToQueue("AUTH_NOTIFICATION.USER_CREATED", {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username, 
      fullName: newUser.fullName,
    }),
    publishToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", newUser),
  ]);

  const token = jwt.sign(
    {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    message: "User registered successfully",
    newUser: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      addresses: newUser.addresses,
    },
  });
};

// POST /auth/login
const loginUser = async (req, res) => {
  const { username, email, password } = req.body;
  const user = await userModel
    .findOne({ $or: [{ username }, { email }] })
    .select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "User logged in successfully",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      addresses: user.addresses,
    },
  });
};

// GET /auth/me
const getUserProfile = async (req, res) => {
  return res.status(200).json({
    message: "User profile retrieved successfully",
    user: req.user,
  });
};

// GET /auth/logout
const logoutUser = async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    // blacklist token in Redis with expiration
    await redis.set(`blacklist_${token}`, "true", "EX", 24 * 60 * 60); // expire in 1 day
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({ message: "User logged out successfully" });
};

// GET /auth/users/me/addresses
const getUserAddresses = async (req, res) => {
  const id = req.user.id;

  const user = await userModel.findById(id).select("addresses");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "User addresses retrieved successfully",
    addresses: user.addresses,
  });
};
// POST /auth/users/me/addresses
const addUserAddress = async (req, res) => {
  const id = req.user.id;
  const { street, city, state, country, zip, isDefault } = req.body;

  const user = await userModel.findOneAndUpdate(
    { _id: id },
    {
      $push: {
        addresses: {
          street,
          city,
          state,
          country,
          zip,
          isDefault,
        },
      },
    },
    { returnDocument: "after" },
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(201).json({
    message: "Address added successfully",
    addresses: user.addresses,
  });
};

const deleteUserAddress = async (req, res) => {
  const id = req.user.id;
  const { addressId } = req.params;

  try {
    const user = await userModel.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { returnDocument: "after" },
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or address not found" });
    }
    return res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(404).json({ message: "Invalid address ID" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
};
