import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/error.js";
import connectedToDb from "./database/index.js";
import { connectToRabbit, subscribeEvent } from "./utils/rabbitMQ.js";
import searchRouter from "./routes/search-routes.js";
import requestLogger from "./middleware/logs.js";
import {
  handlePostCreation,
  handleDeletePost,
} from "./handlers/search-handler.js";

const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use("/api/search/", searchRouter);

app.use(errorHandler);

(async () => {
  const connected = await connectedToDb();

  if (!connected) {
    logger.info(
      "Warning: Database connection failed. Server will start but database operations may be unavailable.",
    );

    app.locals.dbConnected = false;
  } else {
    app.locals.dbConnected = true;
  }

  await connectToRabbit();

  await subscribeEvent("post.created", handlePostCreation);
  await subscribeEvent("post.deleted", handleDeletePost);

  app.listen(PORT, () => {
    logger.info(`Server started at port: ${PORT}`);
  });
})();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
