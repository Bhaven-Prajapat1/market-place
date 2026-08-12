const mongoose = require("mongoose");

const addressesSchema = new mongoose.Schema({
  city: String,
  country: String,
  state: String,
  street: String,
  zip: String,
  isDefault: { type: Boolean, default: false },
});

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  fullName: {
    firstName: { type: String ,required: true},
    lastName: { type: String ,required: true},
  },
  role: {
    type: String,
    enum: ["user", "seller"],
    default: "user",
  },
  addresses: [addressesSchema],
});

const userModel = mongoose.model("user", schema);
module.exports = userModel;
