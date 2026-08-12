const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: { firstName: "Test", lastName: "User" },
      role: "user",
      addresses: [
        {
          street: "123 Main St",
          city: "Testville",
          state: "TS",
          zip: "12345",
          country: "Testland",
        },
      ],
    };
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.newUser).toHaveProperty("username", userData.username);
    expect(res.body.newUser).toHaveProperty("email", userData.email);
    expect(res.body.newUser).toHaveProperty("role", userData.role);
    expect(res.body.newUser.addresses).toMatchObject(userData.addresses);
    // Check user in DB
    const userInDb = await userModel.findOne({ email: userData.email });
    expect(userInDb).not.toBeNull();
  });

  it("should not register user with duplicate email", async () => {
    const userData = {
      username: "testuser2",
      email: "test@example.com",
      password: "password123",
      fullName: { firstName: "Test", lastName: "User" },
      role: "user",
      addresses: [],
    };
    // First registration
    await request(app).post("/api/auth/register").send(userData);
    // Duplicate registration
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "User with this email or username already exists",
    );
  });

  it("should return 400 if required fields are missing", async () => {
    const incompleteUserData = {
      // missing username, email, password
      fullName: { firstName: "Test", lastName: "User" },
      role: "user",
      addresses: [],
    };
    const res = await request(app)
      .post("/api/auth/register")
      .send(incompleteUserData);
    expect(res.statusCode).toBe(400);
    // expect(res.body).toHaveProperty("message");
    // Optionally check for specific error message if implemented
    // expect(res.body.message).toMatch(/missing/i);
  });
});

