import Search from "../models/Search.js";
import logger from "../utils/logger.js";

async function handlePostCreation(event) {
  try {
    const newPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
    });

    await newPost.save();
    logger.info(
      `Search Post created: ${event.postId}, ${newPost._id.toString()}`,
    );
  } catch (err) {
    logger.error(`Error @ Handle Post Creation: ${err}`);
  }
}

async function handleDeletePost(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    logger.info(`Search post deleted: ${event.postId}`);
  } catch (err) {
    logger.error(`Error @ Handle Delete Creation: ${err}`);
  }
}

export { handlePostCreation, handleDeletePost };
