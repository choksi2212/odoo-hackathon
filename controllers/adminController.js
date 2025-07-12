const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get all questions for moderation
// @route   GET /api/admin/questions
// @access  Admin
const getQuestionsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status = 'all' } = req.query;

    let query = {};
    if (status === 'reported') {
      // Add logic for reported questions when implemented
      query = { /* reported: true */ };
    }

    const questions = await Question.find(query)
      .populate('createdBy', 'username email isBanned')
      .populate('acceptedAnswer', 'content createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments(query);

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

// @desc    Get all answers for moderation
// @route   GET /api/admin/answers
// @access  Admin
const getAnswersForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({})
      .populate('createdBy', 'username email isBanned')
      .populate('questionId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Answer.countDocuments({});

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

// @desc    Ban/Unban user
// @route   PATCH /api/admin/ban/:userId
// @access  Admin
const toggleUserBan = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString()) {
      throw new AppError('Cannot ban yourself', 400);
    }

    // Prevent admin from banning other admins
    if (user.isAdmin && !req.user.isAdmin) {
      throw new AppError('Cannot ban other administrators', 403);
    }

    user.isBanned = !user.isBanned;
    await user.save();

    // Create notification for user
    await Notification.createNotification({
      userId: user._id,
      type: 'admin',
      title: user.isBanned ? 'Account Banned' : 'Account Unbanned',
      message: user.isBanned 
        ? `Your account has been banned. Reason: ${reason || 'No reason provided'}`
        : 'Your account has been unbanned. You can now use the platform again.',
      link: '/',
      relatedUser: req.user._id,
      metadata: { reason }
    });

    res.json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isBanned: user.isBanned,
          isAdmin: user.isAdmin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      bannedUsers,
      adminUsers,
      totalNotifications
    ] = await Promise.all([
      User.countDocuments({}),
      Question.countDocuments({}),
      Answer.countDocuments({}),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ isAdmin: true }),
      Notification.countDocuments({})
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      newUsers,
      newQuestions,
      newAnswers
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Question.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Answer.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get top tags
    const topTags = await Question.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$_id',
          count: 1
        }
      }
    ]);

    // Get top users by reputation
    const topUsers = await User.find({ isBanned: false })
      .select('username reputation createdAt')
      .sort({ reputation: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalQuestions,
          totalAnswers,
          bannedUsers,
          adminUsers,
          totalNotifications
        },
        recentActivity: {
          newUsers,
          newQuestions,
          newAnswers,
          period: '7 days'
        },
        topTags,
        topUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question (admin)
// @route   DELETE /api/admin/questions/:id
// @access  Admin
const deleteQuestionAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Delete associated answers
    await Answer.deleteMany({ questionId: id });

    // Delete the question
    await Question.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Question deleted successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete answer (admin)
// @route   DELETE /api/admin/answers/:id
// @access  Admin
const deleteAnswerAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    // If this was the accepted answer, unaccept it
    if (answer.isAccepted) {
      const question = await Question.findById(answer.questionId);
      if (question) {
        question.acceptedAnswer = null;
        await question.save();
      }
    }

    await Answer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Answer deleted successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        users,
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

module.exports = {
  getQuestionsForModeration,
  getAnswersForModeration,
  toggleUserBan,
  getPlatformStats,
  deleteQuestionAdmin,
  deleteAnswerAdmin,
  getAllUsers
}; 