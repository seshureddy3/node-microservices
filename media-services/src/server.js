import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import logger from "./utils/logger.js";
import connectToDb from "./database/db.js";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/logs.js";
import mediaRoutes from "./routes/media-routes.js";

const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

(async () => {
  const connected = await connectToDb();

  if (!connected) {
    logger.error(
      `Warning: Database connection failed. Server will start but database operations may be unavailable.`,
    );
    app.locals.dbConnected = false;
  } else {
    app.locals.dbConnected = true;
  }

  app.listen(PORT, () => {
    logger.info(`Server is started at port: ${PORT}`);
  });
})();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
