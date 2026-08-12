const redis = require("redis");

let client;

async function connectRedis() {
  if (client) return client;

  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      password: process.env.REDIS_PASSWORD,
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
      console.log("Connected to Redis");
    });

    await client.connect();
    return client;
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    throw err;
  }
}

async function getFromCache(key) {
  if (!client) await connectRedis();
  try {
    return await client.get(key);
  } catch (err) {
    console.error("Error getting from cache:", err);
    return null;
  }
}

async function setInCache(key, value, expiryInSeconds = 3600) {
  if (!client) await connectRedis();
  try {
    await client.setEx(key, expiryInSeconds, JSON.stringify(value));
  } catch (err) {
    console.error("Error setting cache:", err);
  }
}

async function deleteFromCache(key) {
  if (!client) await connectRedis();
  try {
    await client.del(key);
  } catch (err) {
    console.error("Error deleting from cache:", err);
  }
}

async function flushCache() {
  if (!client) await connectRedis();
  try {
    await client.flushDb();
  } catch (err) {
    console.error("Error flushing cache:", err);
  }
}

module.exports = {
  connectRedis,
  getFromCache,
  setInCache,
  deleteFromCache,
  flushCache,
};
