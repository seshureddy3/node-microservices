import logger from "../utils/logger.js";

const authenticateUser = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn(`Access attempted without user ID from Ip: ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue.",
    });
  }

  req.user = { userId };
  next();
};

export { authenticateUser };
