import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const checkFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type! Please upload only image or video"),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
}).any();

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }

    next();
  });
};

export default uploadMiddleware;
