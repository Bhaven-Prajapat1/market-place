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

function makeOrder({
  user,
  amount = 100,
  currency = "INR",
  status = "PENDING",
} = {}) {
  const prodId = new mongoose.Types.ObjectId();

  return {
    user,
    items: [
      {
        product: prodId,
        quantity: 1,
        price: { amount, currency },
      },
    ],
    status,
    totalPrice: { amount, currency },
    shippingAddress: {
      street: "123 Street",
      city: "Pune",
      state: "MH",
      country: "IN",
      pincode: "411001",
    },
  };
}

describe("POST /api/orders/:id/cancel - buyer initiated cancel (pending/paid rules)", () => {
  test("401 when no auth cookie", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).post(`/api/orders/${orderId}/cancel`);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Unauthorized: No token provided",
    });
  });

  test("404 when order does not exist", async () => {
    const { cookie } = makeAuthCookie();
    const missingOrderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/orders/${missingOrderId}/cancel`)
      .set("Cookie", [cookie]);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      message: "Order not found",
    });
  });

  test("403 when attempting to cancel another customer's order", async () => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    const otherUserId = new mongoose.Types.ObjectId().toString();

    const { cookie } = makeAuthCookie({ id: otherUserId });
    const order = await orderModel.create(makeOrder({ user: ownerId }));

    const res = await request(app)
      .post(`/api/orders/${order._id.toString()}/cancel`)
      .set("Cookie", [cookie]);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      message: expect.any(String),
    });
  });

  test("200 cancels a PENDING order and persists status CANCELLED", async () => {
    const { cookie, userId } = makeAuthCookie();
    const order = await orderModel.create(
      makeOrder({ user: userId, status: "PENDING" }),
    );

    const res = await request(app)
      .post(`/api/orders/${order._id.toString()}/cancel`)
      .set("Cookie", [cookie])
      .send({ reason: "Changed my mind" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      _id: order._id.toString(),
      user: userId,
      status: "CANCELLED",
    });

    const updated = await orderModel.findById(order._id).lean();
    expect(updated.status).toBe("CANCELLED");
  });

  test("200 cancels a paid order when allowed by policy (e.g. CONFIRMED before shipping)", async () => {
    const { cookie, userId } = makeAuthCookie();
    const order = await orderModel.create(
      makeOrder({ user: userId, status: "CONFIRMED" }),
    );

    const res = await request(app)
      .post(`/api/orders/${order._id.toString()}/cancel`)
      .set("Cookie", [cookie])
      .send({ reason: "Need to update items" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      _id: order._id.toString(),
      user: userId,
      status: "CANCELLED",
    });

    const updated = await orderModel.findById(order._id).lean();
    expect(updated.status).toBe("CANCELLED");
  });

  test("409 when order is already shipped or delivered", async () => {
    const { cookie, userId } = makeAuthCookie();

    const shipped = await orderModel.create(
      makeOrder({ user: userId, status: "SHIPPED" }),
    );

    const delivered = await orderModel.create(
      makeOrder({ user: userId, status: "DELIVERED" }),
    );

    const res1 = await request(app)
      .post(`/api/orders/${shipped._id.toString()}/cancel`)
      .set("Cookie", [cookie]);

    const res2 = await request(app)
      .post(`/api/orders/${delivered._id.toString()}/cancel`)
      .set("Cookie", [cookie]);

    expect(res1.status).toBe(409);
    expect(res1.body).toMatchObject({ message: expect.any(String) });

    expect(res2.status).toBe(409);
    expect(res2.body).toMatchObject({ message: expect.any(String) });
  });

  test("409 when order is already cancelled", async () => {
    const { cookie, userId } = makeAuthCookie();

    const order = await orderModel.create(
      makeOrder({ user: userId, status: "CANCELLED" }),
    );

    const res = await request(app)
      .post(`/api/orders/${order._id.toString()}/cancel`)
      .set("Cookie", [cookie]);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      message: expect.any(String),
    });
  });
});
