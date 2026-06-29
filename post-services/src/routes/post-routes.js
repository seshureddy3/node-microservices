import express, { Router } from "express";
import { sensitiveEndpointsLimiter } from "../middleware/rateLimiter.js";
import { createPost } from "../controllers/Post-controller.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = Router();

const exp = express();

exp.use(authMiddleWare);

router.post("/createPost", createPost);

export default router;
