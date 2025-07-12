const Question = require('../models/Question');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get all tags with usage count
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const { limit = 50, sort = 'count' } = req.query;

    // Aggregate to get tag usage statistics
    const tagStats = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          questions: { $push: '$_id' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          questionCount: { $size: '$questions' }
        }
      }
    ]);

    // Sort tags
    let sortedTags = tagStats;
    switch (sort) {
      case 'count':
        sortedTags = tagStats.sort((a, b) => b.count - a.count);
        break;
      case 'name':
        sortedTags = tagStats.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        // For recent tags, we'd need to include date in aggregation
        sortedTags = tagStats.sort((a, b) => b.count - a.count);
        break;
      default:
        sortedTags = tagStats.sort((a, b) => b.count - a.count);
    }

    // Apply limit
    const limitedTags = sortedTags.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        tags: limitedTags,
        total: tagStats.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions by tag
// @route   GET /api/tags/:tag
// @access  Public
const getQuestionsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { sort = 'newest' } = req.query;

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'votes':
        sortObj = { 'votes.value': -1 };
        break;
      case 'views':
        sortObj = { views: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Find questions with this tag
    const questions = await Question.find({ tags: tag.toLowerCase() })
      .populate('createdBy', 'username reputation avatar')
      .populate('acceptedAnswer', 'content createdBy')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Question.countDocuments({ tags: tag.toLowerCase() });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        tag,
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular tags
// @route   GET /api/tags/popular
// @access  Public
const getPopularTags = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const popularTags = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        tags: popularTags
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search tags
// @route   GET /api/tags/search/:query
// @access  Public
const searchTags = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    const matchingTags = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $match: {
          tags: { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        query,
        tags: matchingTags
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getQuestionsByTag,
  getPopularTags,
  searchTags
}; 