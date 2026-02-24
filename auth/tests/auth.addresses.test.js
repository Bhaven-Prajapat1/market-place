// tests/auth.addresses.test.js

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
    username: "testuser",
    email: "testuser@example.com",
    password: "Test@1234",
    fullName: {
      firstName: "Test",
      lastName: "User",
    },
    addresses: [
      { street: "123 Main St", city: "Testville", isDefault: true },
      { street: "456 Side St", city: "Testville", isDefault: false },
    ],
  };
  await request(app).post("/api/auth/register").send(userData);
  // Login to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "testuser@example.com", password: "Test@1234" });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET '/api/auth/users/me/addresses'", () => {
  it("should return a list of saved addresses with default marked", async () => {
    const res = await request(app)
      .get("/api/auth/users/me/addresses")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.addresses)).toBe(true);
    expect(res.body.addresses.length).toBeGreaterThan(0);
    const defaultAddresses = res.body.addresses.filter(
      (addr) => addr.isDefault,
    );
    expect(defaultAddresses.length).toBe(1);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(app).get("/api/auth/users/me/addresses");
    expect(res.statusCode).toBe(401);
  });
});
