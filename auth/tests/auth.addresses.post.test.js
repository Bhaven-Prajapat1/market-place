const request = require("supertest");
const app = require("../src/app");
const connectDB = require("../src/db/db");
const User = require("../src/models/user.model");
const mongoose = require("mongoose");

let token;

beforeAll(async () => {
  await connectDB();
  // Register user via API
  const userData = {
    username: "postaddressuser",
    email: "postaddressuser@example.com",
    password: "Test@1234",
    fullName: {
      firstName: "Post",
      lastName: "User",
    },
    addresses: [],
  };
  await request(app).post("/api/auth/register").send(userData);
  // Login to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "postaddressuser@example.com", password: "Test@1234" });
  token = res.body.token;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});

describe("POST /api/auth/users/me/addresses", () => {
  it("should add a new address with valid pincode and phone", async () => {
    const address = {
      street: "789 New St",
      city: "Newville",
      state: "NV",
      country: "Testland",
      zip: "123456",
      phone: "9876543210",
      isDefault: false,
    };
    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(address);
    expect(res.statusCode).toBe(201);
    expect(res.body.addresses).toBeDefined();
    expect(res.body.addresses.length).toBeGreaterThan(0);
  });

  it("should fail with invalid pincode", async () => {
    const address = {
      street: "Invalid St",
      city: "Failville",
      state: "FL",
      country: "Testland",
      zip: "abc123",
      phone: "9876543210",
      isDefault: false,
    };
    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(address);
    expect(res.statusCode).toBe(400);
  });

  it("should fail with invalid phone", async () => {
    const address = {
      street: "Invalid St",
      city: "Failville",
      state: "FL",
      country: "Testland",
      zip: "123456",
      phone: "1234",
      isDefault: false,
    };
    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(address);
    expect(res.statusCode).toBe(400);
  });
});
