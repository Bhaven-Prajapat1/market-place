const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

module.exports = {
  setupDB: async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = "testsecret"; // Set a test JWT secret
    await mongoose.connect(uri);
  },
  teardownDB: async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  },
  clearDB: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  },
};
