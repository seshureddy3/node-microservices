import { Router } from "express";

import { uploadMedia } from "../controllers/media-controller.js";
import uploadMiddleware from "../middleware/media.js";
import { authenticateUser } from "../middleware/authMiddleWare.js";
import logger from "../utils/logger.js";
import multer from "multer";

const router = Router();

const upload = uploadMiddleware;

router.post(
  "/upload",
  authenticateUser,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer error while uploading: ${err.message}`);
        return res.status(400).json({
          message: "Multer error while uploading:",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error(`Unknown error occured while uploading: ${err.message}`);
        return res.status(500).json({
          message: "Unknown error occured while uploading:",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }

      next();
    });
  },
  uploadMedia,
);

export default router;
