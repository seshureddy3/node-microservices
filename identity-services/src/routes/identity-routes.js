import { Router } from "express";
import { registerUser } from "../controllers/identity-controller.js";
import { sensitiveEndpointsLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", sensitiveEndpointsLimiter, registerUser);

export default router;
