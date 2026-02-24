const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("GET /api/auth/me", () => {
  let token;
  const userData = {
    username: "meuser",
    email: "meuser@example.com",
    password: "mepassword123",
    fullName: { firstName: "Me", lastName: "User" },
    role: "user",
    addresses: [],
  };

  beforeAll(async () => {
    // Register user
    await request(app).post("/api/auth/register").send(userData);
    // Login to get token
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = res.body.token;
  });

  it("should return user profile for valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", userData.email);
    expect(res.body.user).toHaveProperty("username", userData.username);
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});


