import logger from "../utils/logger.js";
import Media from "../models/Media.js";
import { uploadMediaToCloudinary } from "../utils/mediaHandler.js";

const uploadMedia = async (req, res) => {
  logger.info("Upload Media controller hits..");
  try {
    if (!req.file) {
      logger.warn("No file found. Please add a file and try again");
      return res.status(400).json({
        success: false,
        message: "No file found, Please add a file and try again",
      });
    }

    const { originalname, mimetype } = req.file;
    const userId = req.user?.userId;

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `File uploaded to cloudinary. Public ID: ${cloudinaryUploadResult.public_id}`,
    );

    const newMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newMedia.save();

    return res.status(201).json({
      success: true,
      message: "Media Uploaded!",
      mediaId: newMedia._id,
      data: newMedia,
    });
  } catch (err) {
    logger.error(
      `Error creating media @ media controller uploadMedia function: ${err}`,
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const getAllMedias = async (req, res) => {
  try {
    const result = await Media.find({ userId: req.user.userId });

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cann't find any media for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    logger.error("Error fetching medias", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medias",
    });
  }
};

export { uploadMedia, getAllMedias };
