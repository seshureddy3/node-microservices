import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(
    `Error from errorHandler @ media-service->middleware folder: ${err.stack}`,
  );

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
