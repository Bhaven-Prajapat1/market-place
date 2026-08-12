const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

function makeAuthCookie(payload = {}) {
  const userId = payload.id || new mongoose.Types.ObjectId().toString();
  const token = jwt.sign(
    {
      id: userId,
      role: payload.role || "user",
      ...payload,
    },
    process.env.JWT_SECRET,
  );
  return { userId, cookie: `token=${token}` };
}

describe("GET /api/orders/:id - Get order by id with payment summary", () => {
  test("401 when no auth cookie", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/api/orders/${orderId}`);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Unauthorized: No token provided",
    });
  });

  test("404 when order does not exist", async () => {
    const { cookie } = makeAuthCookie();

    const missingOrderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/orders/${missingOrderId}`)
      .set("Cookie", [cookie]);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      message: "Order not found",
    });
  });

  test("200 returns order + payment summary", async () => {
    const { cookie, userId } = makeAuthCookie();

    const prod1Id = new mongoose.Types.ObjectId();
    const prod2Id = new mongoose.Types.ObjectId();

    const order = await orderModel.create({
      user: userId,
      items: [
        {
          product: prod1Id,
          quantity: 2,
          price: { amount: 100, currency: "INR" },
        },
        {
          product: prod2Id,
          quantity: 1,
          price: { amount: 250, currency: "INR" },
        },
      ],
      status: "PENDING",
      totalPrice: { amount: 450, currency: "INR" },
      shippingAddress: {
        street: "123 Street",
        city: "Pune",
        state: "MH",
        country: "IN",
        pincode: "411001",
      },
    });

    const res = await request(app)
      .get(`/api/orders/${order._id.toString()}`)
      .set("Cookie", [cookie]);

      console.log("Response body:", res.body);

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      _id: order._id.toString(),
      user: userId,
      status: "PENDING",
      totalPrice: { amount: 450, currency: "INR" },
    });

    // Payment summary contract: totals broken down for checkout UI
    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      _id: order._id.toString(),
      user: userId,
      status: "PENDING",
      totalPrice: { amount: 450, currency: "INR" },
    });
  });
});
