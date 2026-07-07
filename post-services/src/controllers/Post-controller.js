import Post from "../models/Posts.js";
import logger from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitmq.js";
import { validateCreatePost } from "../utils/validation.js";

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  // Set up a stream to find keys starting with "posts:" without locking up Redis
  const stream = req.redisClient.scanStream({
    match: "posts:*", // FIXED: Added the wildcard '*' to catch posts:1:10, posts:2:10, etc.
    count: 100, // Process 100 keys at a time
  });

  stream.on("data", async (resultKeys) => {
    if (resultKeys.length > 0) {
      logger.info(`Invalidating stale feed caches: ${resultKeys}`);
      await req.redisClient.del(resultKeys);
    }
  });

  stream.on("end", () => {
    logger.info("Feed cache invalidation cycle completed successfully.");
  });
}

const createPost = async (req, res) => {
  logger.info("CreatePost controller hits..");
  try {
    const { error } = validateCreatePost(req.body);

    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message || "validataion error",
      });
    }

    const { content, mediaId } = req.body;

    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaId: mediaId || [],
    });

    await newPost.save();

    await invalidatePostCache(req, newPost._id.toString());
    logger.info(`Post created successfully: ${newPost}`);
    return res.status(201).json({
      success: true,
      message: "Post created",
      post: newPost,
    });
  } catch (err) {
    logger.error(`Internal server error @ createPost controller: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPosts = async (req, res) => {
  logger.info("Get posts controller hit..");
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const startIndex = (page - 1) * limit;

    const cachedKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cachedKey);

    if (cachedPosts) {
      logger.info(`Cache hit for key: ${cachedKey}`);
      return res.status(200).json({
        success: true,
        message: "Fetched from cache",
        data: JSON.parse(cachedPosts),
      });
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts: totalPosts,
    };

    // Cache the result for 5 minutes (300 seconds)
    await req.redisClient.setex(cachedKey, 300, JSON.stringify(result));

    return res.status(200).json({
      success: true,
      message: "All posts fetched!",
      data: result,
    });
  } catch (err) {
    logger.error(`Internal server error @ getPosts controller: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPost = async (req, res) => {
  logger.info("get post controller hit..");
  try {
    const { id } = req.params;
    const cachedKey = `posts:${id}`;
    const cachedPost = await req.redisClient.get(cachedKey);

    if (cachedPost) {
      logger.info(`Cache hit for key: ${cachedKey}`);
      return res.status(200).json({
        success: true,
        message: "Fetched from Cache",
        data: cachedPost,
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      logger.warn(`Post not found!`);
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    await req.redisClient.setex(cachedPost, 300, JSON.stringify(post));

    return res.status(200).json({
      success: true,
      message: "Post fetched!",
      data: post,
    });
  } catch (err) {
    logger.error(`Internal server error @ getPost controller: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  logger.info("delete post controller hit");
  try {
    const { id } = req.params;

    const deletedPost = await Post.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });

    if (!deletedPost) {
      logger.info("No posts found!");
      return res.status(404).json({
        success: false,
        message: "No post found!",
      });
    }

    // publish post delete method

    await publishEvent("post.deleted", {
      postId: deletedPost._id.toString(),
      userId: req.user.userId,
      mediaIds: deletedPost.mediaId || [],
    });

    await invalidatePostCache(req, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Post deleted!",
      data: deletedPost,
    });
  } catch (err) {
    logger.error(
      `Internal server error @ deletePost controller: ${err.message}`,
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createPost, getPosts, getPost, deletePost };
