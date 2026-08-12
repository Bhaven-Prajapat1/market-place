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
      street: "Old Street",
      city: "Pune",
      state: "MH",
      country: "IN",
      pincode: "411001",
    },
  };
}

describe("PATCH /api/orders/:id/address - update delivery address prior to payment capture", () => {
  test("401 when no auth cookie", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/orders/${orderId}/address`)
      .send({
        shippingAddress: {
          street: "New Street",
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "400001",
        },
      });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Unauthorized: No token provided",
    });
  });

  test("404 when order does not exist", async () => {
    const { cookie } = makeAuthCookie();
    const missingOrderId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/orders/${missingOrderId}/address`)
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: "New Street",
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "400001",
        },
      });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      message: "Order not found",
    });
  });

  test("403 when attempting to update another customer's order", async () => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    const otherUserId = new mongoose.Types.ObjectId().toString();

    const { cookie } = makeAuthCookie({ id: otherUserId });

    const order = await orderModel.create(makeOrder({ user: ownerId }));

    const res = await request(app)
      .patch(`/api/orders/${order._id.toString()}/address`)
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: "New Street",
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "400001",
        },
      });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      message: expect.any(String),
    });
  });

  test("400 when shipping address is invalid", async () => {
    const { cookie, userId } = makeAuthCookie();
    const order = await orderModel.create(makeOrder({ user: userId }));

    const res = await request(app)
      .patch(`/api/orders/${order._id.toString()}/address`)
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: 123,
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "abc",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        errors: expect.any(Array),
      }),
    );
  });

  test("200 updates shipping address for a PENDING order", async () => {
    const { cookie, userId } = makeAuthCookie();

    const order = await orderModel.create(
      makeOrder({ user: userId, status: "PENDING", amount: 450 }),
    );

    const newAddress = {
      street: "New Street",
      city: "Mumbai",
      state: "MH",
      country: "IN",
      pincode: "400001",
    };

    const res = await request(app)
      .patch(`/api/orders/${order._id.toString()}/address`)
      .set("Cookie", [cookie])
      .send({ shippingAddress: newAddress });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      _id: order._id.toString(),
      user: userId,
      status: "PENDING",
    });

    expect(res.body.order.shippingAddress).toMatchObject(newAddress);

    const updated = await orderModel.findById(order._id).lean();
    expect(updated.shippingAddress).toMatchObject(newAddress);
  });

  test("409 when order is not eligible for address update (payment already captured)", async () => {
    const { cookie, userId } = makeAuthCookie();

    const order = await orderModel.create(
      makeOrder({ user: userId, status: "CONFIRMED" }),
    );

    const res = await request(app)
      .patch(`/api/orders/${order._id.toString()}/address`)
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: "New Street",
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "400001",
        },
      });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      message: expect.any(String),
    });
  });
});
