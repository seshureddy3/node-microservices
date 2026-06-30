import cloudinary from "../config/cloudinary.js";

import logger from "./logger.js";

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(file.path, { resource_type: "auto" })
      .then((result) => resolve(result))
      .catch((error) => {
        const errorMessage = error?.message || JSON.stringify(error) || error;
        logger.error(
          `Error while uploading media to cloudinary, ${errorMessage}`,
        );
        reject(error);
      });
  });
};

export { uploadMediaToCloudinary };
