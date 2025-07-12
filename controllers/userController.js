const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username })
      .select('-passwordHash')
      .lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user's questions
    const questions = await Question.find({ createdBy: user._id })
      .populate('acceptedAnswer', 'content createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user's answers
    const answers = await Answer.find({ createdBy: user._id })
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get counts
    const questionCount = await Question.countDocuments({ createdBy: user._id });
    const answerCount = await Answer.countDocuments({ createdBy: user._id });

    // Calculate reputation from votes
    const questionVotes = await Question.aggregate([
      { $match: { createdBy: user._id } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: null,
          totalVotes: { $sum: '$votes.value' }
        }
      }
    ]);

    const answerVotes = await Answer.aggregate([
      { $match: { createdBy: user._id } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: null,
          totalVotes: { $sum: '$votes.value' }
        }
      }
    ]);

    const totalVotes = (questionVotes[0]?.totalVotes || 0) + (answerVotes[0]?.totalVotes || 0);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          reputation: totalVotes
        },
        questions: {
          items: questions,
          count: questionCount,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(questionCount / limit),
            totalItems: questionCount,
            hasNextPage: page < Math.ceil(questionCount / limit),
            hasPrevPage: page > 1,
            limit
          }
        },
        answers: {
          items: answers,
          count: answerCount,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(answerCount / limit),
            totalItems: answerCount,
            hasNextPage: page < Math.ceil(answerCount / limit),
            hasPrevPage: page > 1,
            limit
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's questions
// @route   GET /api/users/me/questions
// @access  Private
const getMyQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ createdBy: req.user._id })
      .populate('acceptedAnswer', 'content createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments({ createdBy: req.user._id });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
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

// @desc    Get current user's answers
// @route   GET /api/users/me/answers
// @access  Private
const getMyAnswers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ createdBy: req.user._id })
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Answer.countDocuments({ createdBy: req.user._id });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        answers,
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

// @desc    Search users
// @route   GET /api/users/search/:query
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('-passwordHash')
      .sort({ reputation: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        users,
        query,
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

// @desc    Get top users by reputation
// @route   GET /api/users/top
// @access  Public
const getTopUsers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({ isBanned: false })
      .select('-passwordHash')
      .sort({ reputation: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        users: topUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  getMyQuestions,
  getMyAnswers,
  searchUsers,
  getTopUsers
}; 