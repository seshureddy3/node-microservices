import { connect } from "mongoose";
import logger from "../utils/logger.js";

const connectToDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    logger.warn("Missing database configuration. Set MONGODB_URI.");
    return false;
  }

  try {
    await connect(MONGODB_URI);
    logger.info("MongoDb connected successfully!");
    return true;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`, {
      service: "post-service",
    });
    return res.status(500).json({
      success: false,
      message: "MongoDb Connection failed!",
    });

    return false;
  }
};

export default connectToDB;
