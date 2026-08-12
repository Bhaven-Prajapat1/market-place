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

describe("PATCH /api/products/:id", () => {
  test("updates a product when requested by the owning seller", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await Product.create(
      makeProduct({
        title: "Old title",
        description: "Old description",
        amount: 999,
        seller,
      }),
    );

    const token = makeAuthToken({ id: seller.toString(), role: "seller" });

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated title",
        description: "Updated description",
        priceAmount: 1299,
        priceCurrency: "USD",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        _id: product._id.toString(),
        title: "Updated title",
        description: "Updated description",
        seller: seller.toString(),
        price: expect.objectContaining({
          amount: 1299,
          currency: "USD",
        }),
      }),
    );

    const updatedProduct = await Product.findById(product._id).lean();

    expect(updatedProduct).toEqual(
      expect.objectContaining({
        title: "Updated title",
        description: "Updated description",
        price: expect.objectContaining({
          amount: 1299,
          currency: "USD",
        }),
      }),
    );
  });

  test("returns 401 when token is missing", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await Product.create(makeProduct({ seller }));

    const res = await request(app).patch(`/api/products/${product._id}`).send({
      title: "Updated title",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );

    const unchangedProduct = await Product.findById(product._id).lean();
    expect(unchangedProduct.title).toBe("Item");
  });

  test("returns 403 when the authenticated user is not a seller", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await Product.create(makeProduct({ seller }));
    const token = makeAuthToken({ role: "user" });

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  test("returns 403 when a seller tries to update another seller's product", async () => {
    const ownerSeller = new mongoose.Types.ObjectId();
    const otherSeller = new mongoose.Types.ObjectId();
    const product = await Product.create(makeProduct({ seller: ownerSeller }));
    const token = makeAuthToken({ id: otherSeller.toString(), role: "seller" });

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated by another seller" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );

    const unchangedProduct = await Product.findById(product._id).lean();
    expect(unchangedProduct.title).toBe("Item");
  });

  test("returns 404 when the product does not exist", async () => {
    const productId = new mongoose.Types.ObjectId();
    const token = makeAuthToken({ role: "seller" });

    const res = await request(app)
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  test("returns 400 when the product id is invalid", async () => {
    const token = makeAuthToken({ role: "seller" });

    const res = await request(app)
      .patch("/api/products/invalid-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  test("returns 400 when the update payload is invalid", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await Product.create(makeProduct({ seller }));
    const token = makeAuthToken({ id: seller.toString(), role: "seller" });

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        priceAmount: -10,
        priceCurrency: "EUR",
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});
