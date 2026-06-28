import User from "../models/User.js";
import { registerValidation, loginValidation } from "../utils/validation.js";
import generateToken from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import RefreshToken from "../models/RefershToken.js";

const registerUser = async (req, res) => {
  logger.info("register controller hit..");
  try {
    const { error } = registerValidation(req.body);

    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { firstName, lastName, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { name: fullName }],
    });

    if (existingUser) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    });

    await newUser.save();

    const { accessToken, refreshToken } = await generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.warn("Registration error occured", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("Login controller hit...");
  try {
    const { error } = loginValidation(req.body) || {};
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message || "Validation error!",
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("email not registerd");
      return res.status(400).json({
        success: false,
        message: "email not valid or not registerd",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const { accessToken, refreshToken } = await generateToken(user);

    return res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (err) {
    logger.warn(`Registration error occured, ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit..");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // 1. Find the token

    const existingTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!existingTokenDoc) {
      logger.warn("Token not found. This might be a reuse attack!");
      return res.status(401).json({
        success: false,
        message: "Access denied!",
      });
    }

    // 2. DETECT REUSE: If it was already used, someone stole it!

    if (existingTokenDoc.used) {
      logger.error(
        `CRITICAL: Replay attack detected for user ${existingTokenDoc.user}! Nuking all sessions.`,
      );

      // Revoke EVERYTHING for this user forcing a complete re-login everywhere
      await RefreshToken.deleteMany({ user: existingTokenDoc.user });

      return res.status(401).json({
        success: false,
        message: "Security alert: Replay attack detected. Please log in again.",
      });
    }

    // 3. Check Expiration

    if (existingTokenDoc.expiresAt < new Date()) {
      logger.warn("Refresh token expired");
      await RefreshToken.deleteOne({ _id: existingTokenDoc._id });
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    // 4. Mark it as used instead of deleting right away
    existingTokenDoc.used = true;
    await existingTokenDoc.save();

    const user = await User.findById(existingTokenDoc.user);

    if (!user) {
      logger.warn("user not found!");

      return res.status(401).json({
        success: false,
        message: "user not found!",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    return res.status(200).json({
      success: true,
      message: "refresh token rotated successfully!",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    logger.error("Refresh token error occured", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  logger.info("Logout User api hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.info("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "refresh token missing",
      });
    }

    const existingTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!existingTokenDoc) {
      logger.warn("Refresh token not found or already invalidated");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (existingTokenDoc.used) {
      logger.error(
        `CRITICAL: Replay attempt on a used token during logo ut for user ${existingTokenDoc.user}!`,
      );
      await RefreshToken.deleteMany({ user: existingTokenDoc.user });
      return res.status(401).json({
        success: false,
        message: "Security alert: Token abuse detected. All sessions revoked.",
      });
    }

    // 3. Instead of deleting, mark it as used to keep the security history intact
    existingTokenDoc.used = true;
    await existingTokenDoc.save();

    logger.info(
      `Refresh token invalidated for user ${existingTokenDoc.user} via logout`,
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (err) {
    logger.error("Error while logging out", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, refreshTokenUser, logoutUser };
