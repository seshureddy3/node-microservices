import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);

  // hiding password before logging
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = "[HIDDEN]";
    }
    logger.info(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }

  next();
};

export default requestLogger;
