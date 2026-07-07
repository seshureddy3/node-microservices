import Media from "../models/Media.js";
import { deleteMediaFromCloudinary } from "../utils/mediaHandler.js";
import logger from "../utils/logger.js";

const extractMediaIds = (event = {}) => {
  const mediaIds = event.mediaIds ?? event.mediaId;

  if (!mediaIds) return [];
  if (Array.isArray(mediaIds)) return mediaIds;

  return [mediaIds];
};

const handlePostDeleted = async (event = {}) => {
  const { postId } = event;
  const mediaIds = extractMediaIds(event);

  try {
    if (!mediaIds.length) {
      logger.warn(`No media IDs received for deleted post ${postId}`);
      return;
    }

    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Deleted media ${media._id} associated with deleted post ${postId}`,
      );
    }

    logger.info(`Processed deletion of media for post id ${postId}`);
  } catch (e) {
    logger.error(`Error occurred while media deletion: ${e.message || e}`);
  }
};

export { handlePostDeleted, extractMediaIds };
