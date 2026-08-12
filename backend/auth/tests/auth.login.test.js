const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("POST /api/auth/login", () => {
  it("should login user with correct credentials", async () => {
    // Register user first
    const userData = {
      username: "loginuser",
      email: "login@example.com",
      password: "loginpass123",
      fullName: { firstName: "Login", lastName: "User" },
      role: "user",
      addresses: [],
    };
    await request(app).post("/api/auth/register").send(userData);

    // Login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", userData.email);
  });

  it("should not login with wrong password", async () => {
    const userData = {
      username: "wrongpassuser",
      email: "wrongpass@example.com",
      password: "correctpass",
      fullName: { firstName: "Wrong", lastName: "Pass" },
      role: "user",
      addresses: [],
    };
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/login").send({
      username: "test",
      email: userData.email,
      password: "incorrectpass",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should not login non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "test",
      email: "nouser@example.com",
      password: "nopass",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
