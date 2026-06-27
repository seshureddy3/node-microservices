import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefershToken.js";
import logger from "./logger.js";
import crypto from "crypto";

const generateTokens = async (user) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    logger.warn(
      "Missing JWT configuration. Set JWT_SECRET and REFRESH_SECRET.",
    );
    return false;
  }

  const accessToken = await jwt.sign(
    {
      userId: user._id,
      userName: user.name,
    },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
