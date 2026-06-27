import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshTokenUser,
  registerUser,
} from "../controllers/identity-controller.js";
import { sensitiveEndpointsLimiter } from "../middleware/rateLimiter.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", sensitiveEndpointsLimiter, registerUser);
router.post("/login", sensitiveEndpointsLimiter, loginUser);
router.post("/refershToken", refreshTokenUser);
router.post("/logout", authMiddleWare, logoutUser);

export default router;
