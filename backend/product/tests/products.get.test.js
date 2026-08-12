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

describe("GET /api/products", () => {
  test("returns 200 with empty data when no products exist", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  test("returns existing products", async () => {
    await Product.create([
      makeProduct({ title: "Phone", description: "New phone", amount: 999 }),
      makeProduct({ title: "Camera", description: "DSLR", amount: 1200 }),
    ]);

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
      }),
    );

    const titles = res.body.data.map((p) => p.title);
    expect(titles).toEqual(expect.arrayContaining(["Phone", "Camera"]));
  });

  test("caps limit to 20", async () => {
    const docs = Array.from({ length: 25 }, (_, i) =>
      makeProduct({
        title: `Item ${i + 1}`,
        description: `Desc ${i + 1}`,
        amount: i + 1,
      }),
    );

    await Product.create(docs);

    const res = await request(app).get("/api/products?limit=50");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(20);
  });
});
