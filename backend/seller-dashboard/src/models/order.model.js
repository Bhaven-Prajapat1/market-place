const mongoose = require("mongoose");

const addressesSchema = new mongoose.Schema({
  city: String,
  country: String,
  state: String,
  street: String,
  pincode: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        price: {
          amount: {
            type: Number,
            required: true,
          },
          currency: {
            type: String,
            required: true,
            enum: ["USD", "INR"],
          },
        },
      },
    ],

    totalPrice: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        enum: ["USD", "INR"],
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "DELIVERED", "SHIPPED"],
    },
    shippingAddress: {
      type: addressesSchema,
      required: true,
    },
  },
  { timestamps: true },
);

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;
