import { connect } from "mongoose";
import logger from "../utils/logger.js";

const connectToDb = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    logger.warn(`MongoDb configuration failed @ database -> db.js`);
    return false;
  }

  try {
    await connect(MONGODB_URI);
    logger.info("MongoDb connected!");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(arr);
    logger.error(`MongoDb connection failed: ${err.message}`, {
      service: "media-service",
    });
    return false;
  }
};

export default connectToDb;
