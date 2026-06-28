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
    console.log("MongoDB connected successfully!");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`MongoDB connection failed: ${err.message}`, { service: 'identity-service' });www
    return false;
  }
};

export default connectToDB;
