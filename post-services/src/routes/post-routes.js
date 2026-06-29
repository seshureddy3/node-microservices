import express, { Router } from "express";

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
} from "../controllers/Post-controller.js";
import { authenticateUser } from "../middleware/authMiddleWare.js";

const router = Router();

router.use(authenticateUser);

router.post("/create-post", createPost);
router.get("/all", getPosts);
router.get("/:id", getPost);
router.delete("/delete/:id", deletePost);

export default router;
