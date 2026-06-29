import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import connectToDB from "../../identity-services/src/database/db.js";
import requestLogger from "./middleware/logs.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import routes from "./routes/post-routes.js";

const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use(globalLimiter);

// routes
app.use("/api/posts/", routes);

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
