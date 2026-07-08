import { Router } from "express";

import logger from "../utils/logger.js";
import {
  searchPostController,
  getSearchDocs,
} from "../controllers/search-controller.js";
import { authenticateUser } from "../middleware/authMiddleWare.js";

const router = Router();

router.use(authenticateUser);

router.get("/all", getSearchDocs);
router.get("/posts", searchPostController);

export default router;
