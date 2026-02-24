const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("GET /api/auth/logout", () => {
  let token;
  beforeAll(async () => {
    // Register and login user to get token
    const userData = {
      username: "logoutuser",
      email: "logoutuser@example.com",
      password: "logoutpass123",
      fullName: { firstName: "Logout", lastName: "User" },
      role: "user",
      addresses: [],
    };
    await request(app).post("/api/auth/register").send(userData);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = res.body.token;
  });

  it("should logout user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    // Optionally check for specific message
    // expect(res.body.message).toMatch(/logout/i);
  });

  it("should return 401 for missing token", async () => {
    const res = await request(app).get("/api/auth/logout");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/logout")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});