import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/error.js";
import connectToDB from "./database/db.js";
import requestLogger from "./middleware/logs.js";
import { globalLimiter } from "./middleware/ratelimiter.js";
import postRoutes from "./routes/post-routes.js";
import { connectToRabbit } from "./utils/rabbitmq.js";

const app = express();
const { PORT } = process.env;

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on("error", (err) => {
  logger.error(`Redis connection error: ${err}`);
});

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);
app.use(globalLimiter);

//routes

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes,
);

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

  await connectToRabbit();
  app.listen(PORT, () => {
    logger.info(`Server is running at port: ${PORT}`);
  });
})();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
