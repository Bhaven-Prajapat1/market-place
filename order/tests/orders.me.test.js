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

describe("GET /api/orders/me - paginated list of customer's orders", () => {
  test("401 when no auth cookie", async () => {
    const res = await request(app).get("/api/orders/me");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Unauthorized: No token provided",
    });
  });

  test("200 returns empty list when customer has no orders", async () => {
    const { cookie } = makeAuthCookie();

    const res = await request(app)
      .get("/api/orders/me")
      .set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      orders: [],
    });
  });

  test("200 returns only authenticated customer's orders", async () => {
    const customerId = new mongoose.Types.ObjectId().toString();
    const otherCustomerId = new mongoose.Types.ObjectId().toString();

    const { cookie } = makeAuthCookie({ id: customerId });

    await orderModel.create([
      makeOrder({ user: customerId, amount: 100 }),
      makeOrder({ user: customerId, amount: 200 }),
      makeOrder({ user: otherCustomerId, amount: 999 }),
    ]);

    const res = await request(app)
      .get("/api/orders/me")
      .set("Cookie", [cookie]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);

    const users = res.body.orders.map((o) => o.user);
    expect(users).toEqual(expect.arrayContaining([customerId]));
    expect(users).not.toEqual(expect.arrayContaining([otherCustomerId]));
    expect(res.body.orders).toHaveLength(2);
  });

  // test("200 paginates results using page + limit", async () => {
  //   const customerId = new mongoose.Types.ObjectId().toString();
  //   const { cookie } = makeAuthCookie({ id: customerId });

  //   const otherCustomerId = new mongoose.Types.ObjectId().toString();

  //   await orderModel.create([
  //     makeOrder({ user: customerId, amount: 10 }),
  //     makeOrder({ user: customerId, amount: 20 }),
  //     makeOrder({ user: customerId, amount: 30 }),
  //     makeOrder({ user: customerId, amount: 40 }),
  //     makeOrder({ user: customerId, amount: 50 }),
  //     makeOrder({ user: otherCustomerId, amount: 999 }),
  //   ]);

  //   const res1 = await request(app)
  //     .get("/api/orders/me?page=1&limit=2")
  //     .set("Cookie", [cookie]);

  //   const res2 = await request(app)
  //     .get("/api/orders/me?page=2&limit=2")
  //     .set("Cookie", [cookie]);

  //   const res3 = await request(app)
  //     .get("/api/orders/me?page=3&limit=2")
  //     .set("Cookie", [cookie]);

  //   expect(res1.status).toBe(200);
  //   expect(res2.status).toBe(200);
  //   expect(res3.status).toBe(200);

  //   expect(res1.body.orders).toHaveLength(2);
  //   expect(res2.body.orders).toHaveLength(2);
  //   expect(res3.body.orders).toHaveLength(1);

  //   const all = [...res1.body.orders, ...res2.body.orders, ...res3.body.orders];

  //   // Only this customer's orders should be returned
  //   expect(all.every((o) => o.user === customerId)).toBe(true);

  //   // Ensure pages don't repeat items
  //   const ids = all.map((o) => o._id);
  //   expect(new Set(ids).size).toBe(ids.length);
  // });
});
