import Search from "../models/Search.js";
import logger from "../utils/logger.js";

const getSearchDocs = async (req, res) => {
  logger.info("Get Search Docs controller hit..");
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const startIndex = (page - 1) * limit;

    const posts = await Search.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Search.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts: totalPosts,
    };

    return res.status(200).json({
      success: true,
      message: "All posts fetched from Search!",
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

const searchPostController = async (req, res) => {
  logger.info("Search Post controller hit...");
  try {
    const { query } = req.query;

    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No results with query ${query}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err) {
    logger.error(`Error while Seaching post: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export { searchPostController, getSearchDocs };
