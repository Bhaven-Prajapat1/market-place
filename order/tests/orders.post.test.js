const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

jest.mock("axios");
const axios = require("axios");

function makeAuthCookie(payload = {}) {
  const userId = payload.id || new mongoose.Types.ObjectId().toString();
  const token = jwt.sign(
    {
      id: userId,
      role: payload.role || "user",
      ...payload,
    },
    process.env.JWT_SECRET,
  );
  return { userId, cookie: `token=${token}` };
}

describe("POST /api/orders - create order from current cart", () => {
  test("401 when no auth cookie", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        shippingAddress: {
          street: "123 Street",
          city: "Pune",
          state: "MH",
          country: "IN",
          pincode: "411001",
        },
      });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      message: "Unauthorized: No token provided",
    });
  });

  test("400 when shipping address is invalid", async () => {
    const { cookie } = makeAuthCookie();

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: 123,
          city: "Pune",
          state: "MH",
          country: "IN",
          pincode: "abc",
        },
      });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test("201 creates order using cart + product pricing and sets status PENDING", async () => {
    const { cookie, userId } = makeAuthCookie();

    const prod1Id = new mongoose.Types.ObjectId();
    const prod2Id = new mongoose.Types.ObjectId();

    const cart = {
      items: [
        { productId: prod1Id.toString(), quantity: 2 },
        { productId: prod2Id.toString(), quantity: 1 },
      ],
    };

    const productsById = {
      [prod1Id.toString()]: {
        _id: prod1Id.toString(),
        title: "Product 1",
        stock: 10,
        price: { amount: 100, currency: "INR" },
      },
      [prod2Id.toString()]: {
        _id: prod2Id.toString(),
        title: "Product 2",
        stock: 5,
        price: { amount: 250, currency: "INR" },
      },
    };

    axios.get.mockImplementation(async (url) => {
      if (url === "http://localhost:3002/api/cart") {
        return { data: { cart } };
      }

      const match = url.match(/^http:\/\/localhost:3001\/api\/products\/(.+)$/);
      if (match) {
        const id = match[1];
        return { data: { product: productsById[id] } };
      }

      throw new Error(`Unexpected GET ${url}`);
    });

    const shippingAddress = {
      street: "123 Street",
      city: "Pune",
      state: "MH",
      country: "IN",
      pincode: "411001",
    };

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", [cookie])
      .send({ shippingAddress });

    if (res.status !== 201) {
      // Helpful when debugging failures locally
      // eslint-disable-next-line no-console
      console.log("unexpected response", res.status, res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("order");
    expect(res.body.order).toMatchObject({
      user: userId,
      status: "PENDING",
      shippingAddress,
      totalPrice: { amount: 450, currency: "INR" },
    });

    expect(res.body.order.items).toHaveLength(2);
    expect(res.body.order.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          product: prod1Id.toString(),
          quantity: 2,
          price: { amount: 100, currency: "INR" },
        }),
        expect.objectContaining({
          product: prod2Id.toString(),
          quantity: 1,
          price: { amount: 250, currency: "INR" },
        }),
      ]),
    );

    // Ensure it persisted
    const saved = await orderModel.findById(res.body.order._id).lean();
    expect(saved).toBeTruthy();
    expect(saved.status).toBe("PENDING");
    expect(saved.totalPrice.amount).toBe(450);

    // Ensure downstream calls used the cookie token
    expect(axios.get).toHaveBeenCalledWith("http://localhost:3002/api/cart", {
      headers: { Authorization: expect.stringMatching(/^Bearer\s+.+/) },
    });
  });

  test("500 when a cart item quantity exceeds stock; does not create order", async () => {
    const { cookie } = makeAuthCookie();

    const prodOosId = new mongoose.Types.ObjectId();

    const cart = {
      items: [{ productId: prodOosId.toString(), quantity: 3 }],
    };

    axios.get.mockImplementation(async (url) => {
      if (url === "http://localhost:3002/api/cart") {
        return { data: { cart } };
      }

      if (
        url === `http://localhost:3001/api/products/${prodOosId.toString()}`
      ) {
        return {
          data: {
            product: {
              _id: prodOosId.toString(),
              title: "Out of Stock",
              stock: 1,
              price: { amount: 50, currency: "INR" },
            },
          },
        };
      }

      throw new Error(`Unexpected GET ${url}`);
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", [cookie])
      .send({
        shippingAddress: {
          street: "123 Street",
          city: "Pune",
          state: "MH",
          country: "IN",
          pincode: "411001",
        },
      });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      message: "Internal server error",
    });
    expect(res.body.error).toEqual(expect.stringMatching(/out of stock/i));

    const count = await orderModel.countDocuments();
    expect(count).toBe(0);
  });
});
