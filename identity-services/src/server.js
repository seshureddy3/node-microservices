import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";

import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import logger from "./utils/logger.js";
import connectToDB from "./database/db.js";
import routes from "./routes/identity-routes.js";
import errorHandler from "./middleware/error.js";
import requestLogger from "./middleware/logs.js";
import {
  globalLimiter,
  sensitiveEndpointsLimiter,
} from "./middleware/rateLimiter.js";

const app = express();
const { PORT, REDIS_URL } = process.env;

const redisClient = new Redis(REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Safe Logging Middleware
app.use(requestLogger);

// Global DDOS protection and rate limiting
app.use(globalLimiter);

app.use("/api/auth", routes);
app.use(errorHandler);

(async () => {
  const connected = await connectToDB();
  if (!connected) {
    logger.warn(
      "Warning: Database connection failed. Server will start but database operations may be unavailable.",
    );
    app.locals.dbConnected = false;
  } else {
    app.locals.dbConnected = true;
  }

  app.listen(PORT, () => {
    logger.info(`Server is running at port: ${PORT}`);
  });
})();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, reason: ${reason}`);
});
