const { Redis } = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST?.trim() || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error) => {
  console.warn("Redis connection error:", error.message);
});

redis.connect().catch((error) => {
  console.warn("Failed to connect to Redis:", error.message);
});

module.exports = redis;
