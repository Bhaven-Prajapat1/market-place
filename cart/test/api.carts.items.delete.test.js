const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

// Mock the cart model
jest.mock("../src/models/cart.model.js", () => {
  // helper inside factory to avoid out-of-scope reference restriction
  function mockGenerateObjectId() {
    return Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  }
  const carts = new Map();
  class CartMock {
    constructor({ user, items }) {
      this._id = mockGenerateObjectId();
      this.user = user;
      this.items = items || [];
    }
    static async findOne(query) {
      return carts.get(query.user) || null;
    }
    async save() {
      carts.set(this.user, this);
      return this;
    }
  }
  CartMock.__reset = () => carts.clear();
  return CartMock;
});

const CartModel = require("../src/models/cart.model.js");

function generateObjectId() {
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

const deleteBase = "/api/cart/items";

describe("DELETE /api/cart/items/:productId", () => {
  const userId = generateObjectId();
  const productIdA = generateObjectId();
  const productIdB = generateObjectId();

  beforeEach(() => {
    CartModel.__reset();
  });

  test("removes an existing item from the cart", async () => {
    const token = signToken({ _id: userId, role: "user" });

    // Seed cart via existing POST endpoint
    await request(app)
      .post(deleteBase)
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: productIdA, qty: 2 });

    await request(app)
      .post(deleteBase)
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: productIdB, qty: 1 });

    const res = await request(app)
      .delete(`${deleteBase}/${productIdA}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item removed");
    expect(res.body.cart).toBeDefined();
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0]).toMatchObject({
      productId: productIdB,
      quantity: 1,
    });
  });

  test("404 when cart not found", async () => {
    const token = signToken({ _id: userId, role: "user" });

    const res = await request(app)
      .delete(`${deleteBase}/${productIdA}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Cart not found");
  });

  test("404 when item not in cart", async () => {
    const token = signToken({ _id: userId, role: "user" });

    await request(app)
      .post(deleteBase)
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: productIdB, qty: 1 });

    const res = await request(app)
      .delete(`${deleteBase}/${productIdA}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Item not found in cart");
  });

  test("validation error invalid productId param", async () => {
    const token = signToken({ _id: userId, role: "user" });

    const res = await request(app)
      .delete(`${deleteBase}/not-a-valid-id`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("401 when no token", async () => {
    const res = await request(app).delete(`${deleteBase}/${productIdA}`);
    expect(res.status).toBe(401);
  });

  test("403 when role not allowed", async () => {
    const token = signToken({ _id: userId, role: "admin" });

    const res = await request(app)
      .delete(`${deleteBase}/${productIdA}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("401 when token invalid", async () => {
    const res = await request(app)
      .delete(`${deleteBase}/${productIdA}`)
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
  });
});
