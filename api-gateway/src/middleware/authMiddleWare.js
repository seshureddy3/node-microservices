import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const validateUser = (req, res, next) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET environment variable is missing.");
    return res.status(500).json({
      success: false,
      message: "Internal server configuration error",
    });
  }
  try {
    const authHeader = req.headers["authorization"] || "";

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Auth Required! Please provide token!",
      });
    }

    if (!/^bearer\s+\S+/i.test(authHeader)) {
      return res.status(401).json({
        success: false,
        message: "Access denied! Invalid token structure. Use Bearer scheme",
      });
    }

    const token = authHeader.split(/\s+/)[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Malformed token. Please login again",
      });
    }

    const decodeToken = jwt.verify(token, JWT_SECRET);
    req.user = decodeToken;

    const userId =
      decodeToken.userId || decodeToken.id || decodeToken._id || decodeToken.sub;

    if (userId) {
      req.headers["x-user-id"] = String(userId);
    } else {
      logger.warn(
        "Token verified, but no valid user ID claim found in payload.",
      );
    }

    next();
  } catch (err) {
    logger.error("Authentication Error: ", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired! Please login again",
        code: "TOKEN_EXPIRED",
      });
    }

    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token! Authentication failed!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

export default validateUser;
