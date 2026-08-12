// jest.mock("../src/services/imagekit.service", () => ({
//   uploadImage: jest.fn(),
// }));

const request = require("supertest");
const mongoose = require("mongoose");

const Product = require("../src/models/product.model");
const app = require("../src/app");

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

describe("GET /api/products/:id", () => {
  test("returns 200 with the requested product", async () => {
    const product = await Product.create(
      makeProduct({
        title: "Phone",
        description: "New phone",
        amount: 999,
      }),
    );

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        product: expect.objectContaining({
          _id: product._id.toString(),
          title: "Phone",
          description: "New phone",
          price: expect.objectContaining({
            amount: 999,
            currency: "INR",
          }),
        }),
      }),
    );
  });

  test("returns 404 when the product does not exist", async () => {
    const productId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  test("returns 400 when the product id is invalid", async () => {
    const res = await request(app).get("/api/products/invalid-id");

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });
});