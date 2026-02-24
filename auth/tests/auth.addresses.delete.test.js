const request = require("supertest");
const app = require("../src/app");
const connectDB = require("../src/db/db");
const User = require("../src/models/user.model");
const mongoose = require("mongoose");

let token;
let addressId;

beforeAll(async () => {
  await connectDB();
  // Register user via API
  const userData = {
    username: "deleteaddressuser",
    email: "deleteaddressuser@example.com",
    password: "Test@1234",
    fullName: {
      firstName: "Delete",
      lastName: "User",
    },
    addresses: [],
  };
  await request(app).post("/api/auth/register").send(userData);
  // Login to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "deleteaddressuser@example.com", password: "Test@1234" });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("DELETE /api/auth/users/me/addresses/:addressid", () => {
  it("should delete an address", async () => {
    // Add an address first
    const address = {
      street: "Delete St",
      city: "Deleteville",
      state: "DL",
      country: "Testland",
      zip: "654321",
      phone: "9876543210",
      isDefault: false,
    };
    const addRes = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(address);
    addressId = addRes.body.addresses[0]._id;
    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${addressId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.addresses.find((a) => a._id === addressId)).toBeUndefined();
  });

  it("should return 404 for invalid address id", async () => {
    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/invalidid123`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
