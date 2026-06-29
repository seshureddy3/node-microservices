import { connect } from "mongoose";
import logger from "../utils/logger.js";

const connectToDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    logger.error("Missing database configuration. Set MONGODB_URI.");
    return false;
  }

  try {
    await connect(MONGODB_URI);
    return true;
  } catch (err) {
    logger.error("MongoDB connected successfully!");
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });

    return false;
  }
};

export default connectToDB;
