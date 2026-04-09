const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectDB } = require("../src/db/db");

// Used by tests (and auth middleware) to sign/verify JWTs.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

let mongoServer;

async function dropAllCollections() {
  const collections = await mongoose.connection.db?.collections?.();
  if (!collections) return;

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await connectDB();
});

afterEach(async () => {
  await dropAllCollections();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
