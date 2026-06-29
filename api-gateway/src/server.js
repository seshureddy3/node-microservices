import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import helmet from "helmet";
import cors from "cors";
import proxy from "express-http-proxy";

import rateLimiter from "./middleware/rateLimiter.js";
import requestLogger from "./middleware/logs.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import validateUser from "./middleware/authMiddleWare.js";

const app = express();
const { PORT, IDENTITY_SERVICE_URL, POST_SERVICE_URL } = process.env;

app.set("trust proxy", 1);
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(rateLimiter);
app.use(requestLogger);

// proxy

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      err: err.message || "Something went wrong!",
    });
  },
};

// identity service proxy

app.use(
  "/v1/auth",
  proxy(IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`,
      );

      return proxyResData;
    },
  }),
);

// post service proxy

app.use(
  "/v1/posts",
  validateUser,
  proxy(POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";

      if (srcReq.user) {
        const extractedId =
          srcReq.user.id || srcReq.user._id || srcReq.user.userId;

        if (extractedId)
          proxyReqOpts.headers["x-user-id"] = String(extractedId);
      }

      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`,
      );

      return proxyResData;
    },
  }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`,
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`,
  );
  logger.info(`Redis Url ${process.env.REDIS_URL}`);
});
