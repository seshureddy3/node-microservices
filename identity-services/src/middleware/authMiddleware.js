import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const authMiddleWare = (req, res, next) => {
  const { JWT_SECRET } = process.env;
  try {
    const authHeader = req.headers["authorization"] || "";

    if (!authHeader) {
      return res.status(400).json({
        success: false,
        message: "Auth Required! Please provide token!",
      });
    }

    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied! Invalid token structure. use Bearer scheme",
      });
    }

    const tokenParts = authHeader.split(" ");
    const token = tokenParts[1];

    if (tokenParts.length !== 2 || !token) {
      return res.status(401).json({
        success: false,
        message: "Malformed token. Please login again",
      });
    }

    if (!JWT_SECRET) {
      logger.error("CRITICAL: JWT_SECRET environment variable is missing.");
      return res.status(500).json({
        success: false,
        message: "Internal server configuration error",
      });
    }

    const decodeTokenInfo = jwt.verify(token, JWT_SECRET);
    req.userInfo = decodeTokenInfo;

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

export default authMiddleWare;
