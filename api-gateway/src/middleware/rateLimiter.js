import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "../utils/logger.js";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

export default rateLimiter;
