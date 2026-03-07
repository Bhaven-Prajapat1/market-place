const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Product = require("../src/models/product.model");
const app = require("../src/app");

function makeAuthToken({ id, role = "seller" } = {}) {
  const userId = id || new mongoose.Types.ObjectId().toString();
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET);
}

function makeProduct({
  title = "Item",
  description = "Description",
  amount = 100,
  currency = "INR",
  seller,
  images = [],
} = {}) {
  return {
    title,
    description,
    price: {
      amount,
      currency,
    },
    seller: seller || new mongoose.Types.ObjectId(),
    images,
  };
}

describe("GET /api/products/seller", () => {
  test("returns only the authenticated seller's products", async () => {
    const seller = new mongoose.Types.ObjectId();
    const otherSeller = new mongoose.Types.ObjectId();

    await Product.create([
      makeProduct({
        title: "Seller phone",
        description: "Owned by seller",
        seller,
      }),
      makeProduct({
        title: "Seller camera",
        description: "Also owned by seller",
        seller,
      }),
      makeProduct({
        title: "Other product",
        description: "Owned by another seller",
        seller: otherSeller,
      }),
    ]);

    const token = makeAuthToken({ id: seller.toString(), role: "seller" });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
      }),
    );
    expect(res.body.data).toHaveLength(2);

    const titles = res.body.data.map((product) => product.title);
    expect(titles).toEqual(
      expect.arrayContaining(["Seller phone", "Seller camera"]),
    );
    expect(titles).not.toContain("Other product");
  });

  test("returns 200 with empty data when the seller has no products", async () => {
    const seller = new mongoose.Types.ObjectId();
    const token = makeAuthToken({ id: seller.toString(), role: "seller" });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  test("returns 401 when token is missing", async () => {
    const res = await request(app).get("/api/products/seller");

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  test("returns 403 when the authenticated user is not a seller", async () => {
    const token = makeAuthToken({ role: "user" });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});
