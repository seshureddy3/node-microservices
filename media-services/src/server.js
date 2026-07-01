import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import connectToDb from "./database/db.js";
import requestLogger from "./middleware/logs.js";
import mediaRoutes from "./routes/media.js";

const app = express();
const { PORT } = process.env;

app.use(express.json());
app.use(cors());
app.use(helmet());

// custom Middleware
app.use(requestLogger);

// routes middleware

app.use("/api/media", mediaRoutes);

// error handler middleware
app.use(errorHandler);

(async () => {
  const connected = await connectToDb();

  if (!connectToDb) {
    logger.error(
      `Warning: Database connection failed. Server will start but database operations may be unavailable.`,
    );
    app.locals.dbConnected = false;
  } else {
    app.locals.dbConnected = true;
  }

  app.listen(PORT, () => {
    logger.info(`Server is started at ${PORT}`);
  });
})();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${Promise}, reson: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught expression: ${error.message}`);
  process.exit(1);
});
