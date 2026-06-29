import logger from "../utils/logger.js";
import { validateCreatePost } from "../utils/validation.js";
import Post from "../models/Post.js";

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) await req.redisClient.del(keys);
}

const createPost = async (req, res) => {
  logger.info("create post controller hits...");
  try {
    const { error } = validateCreatePost(req.body);

    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;

    const newPost = new Post({
      user: req.user.userId,
      content,
      media: mediaIds || [],
    });

    await newPost.save();

    await invalidatePostCache(req, newPost._id.toString());
    logger.info(`Post created successfully: ${newPost}`);
    return res.status(201).json({
      success: false,
      message: "Post created successfully",
    });
  } catch (err) {
    logger.error("Error creating post", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllPosts = async (req, res) => {};

const getPost = async (req, res) => {};

const deletePost = async (req, res) => {};

export { createPost, getAllPosts, getPost, deletePost };
