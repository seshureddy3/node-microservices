import { connect } from "mongoose";

import logger from "../utils/logger.js";

const connectedToDb = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    logger.warn(`MongoDb configuration failure @ search-service`);
    return false;
  }

  try {
    await connect(MONGODB_URI);
    logger.info("MongoDb connected successfully");
    return true;
  } catch (err) {
    logger.error("MongoDb connection failure");
    return false;
  }
};

export default connectedToDb;
