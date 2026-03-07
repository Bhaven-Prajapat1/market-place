const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/imagekit.service", () => ({
  uploadImage: jest.fn(async ({ fileName }) => ({
    url: `https://example.com/${fileName}`,
    thumbnail: `https://example.com/thumbs/${fileName}`,
    id: "mock_image_id",
  })),
}));

const { uploadImage } = require("../src/services/imagekit.service");
const app = require("../src/app");

function makeAuthToken({ id, role = "seller" } = {}) {
  const userId = id || new mongoose.Types.ObjectId().toString();
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET);
}

describe("POST /api/products", () => {
  test("creates a product with JSON body (no images)", async () => {
    const seller = new mongoose.Types.ObjectId().toString();
    const token = makeAuthToken({ id: seller, role: "seller" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Phone",
        description: "New phone",
        priceAmount: 999,
        priceCurrency: "INR",
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        title: "Phone",
        description: "New phone",
        seller,
        images: [],
        price: expect.objectContaining({
          amount: 999,
          currency: "INR",
        }),
      }),
    );

    expect(uploadImage).not.toHaveBeenCalled();
  });

  test("creates a product with multipart form-data and image upload", async () => {
    const seller = new mongoose.Types.ObjectId().toString();
    const token = makeAuthToken({ id: seller, role: "seller" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Camera")
      .field("description", "DSLR")
      .field("priceAmount", "1200")
      .field("priceCurrency", "USD")
      .attach("images", Buffer.from("fake-image-bytes"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0]).toEqual(
      expect.objectContaining({
        url: "https://example.com/test.jpg",
        thumbnail: "https://example.com/thumbs/test.jpg",
        id: "mock_image_id",
      }),
    );

    expect(uploadImage).toHaveBeenCalledTimes(1);
  });

  test("returns 400 when required fields are missing", async () => {
    const token = makeAuthToken({ role: "seller" });
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Missing title",
        priceAmount: 10,
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Validation failed",
        errors: expect.any(Array),
      }),
    );

    expect(res.body.errors.map((e) => e.msg)).toEqual(
      expect.arrayContaining(["title is required"]),
    );
  });

  test("returns 400 when currency is invalid", async () => {
    const token = makeAuthToken({ role: "seller" });
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Thing",
        description: "A valid description",
        priceAmount: 10,
        priceCurrency: "EUR",
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Validation failed",
        errors: expect.any(Array),
      }),
    );
  });
});
