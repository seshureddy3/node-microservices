import User from "../models/User.js";
import { registerValidation } from "../utils/validation.js";
import generateToken from "../utils/generateToken.js";
import logger from "../utils/logger.js";

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
      email,
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

export { registerUser };
