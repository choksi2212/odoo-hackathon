const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get all questions with pagination and filters
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, tag, sort = 'newest' } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

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
      case 'unanswered':
        query.acceptedAnswer = { $exists: false };
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query
    const questions = await Question.find(query)
      .populate('createdBy', 'username reputation avatar')
      .populate('acceptedAnswer', 'content createdBy')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Question.countDocuments(query);

    // Calculate pagination info
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

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('createdBy', 'username reputation avatar bio')
      .populate('acceptedAnswer', 'content createdBy createdAt')
      .populate('votes.userId', 'username');

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Increment views if user is not the author
    if (!req.user || req.user._id.toString() !== question.createdBy._id.toString()) {
      question.incrementViews();
      await question.save();
    }

    // Get answers for this question
    const answers = await Answer.find({ questionId: id })
      .populate('createdBy', 'username reputation avatar')
      .populate('votes.userId', 'username')
      .sort({ isAccepted: -1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        question,
        answers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    // Normalize tags
    const normalizedTags = tags.map(tag => tag.toLowerCase().trim());

    const question = new Question({
      title,
      description,
      tags: normalizedTags,
      createdBy: req.user._id
    });

    await question.save();

    // Populate creator info
    await question.populate('createdBy', 'username reputation avatar');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        question
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PATCH /api/questions/:id
// @access  Private
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const question = await Question.findById(id);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if user is the author or admin
    if (question.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to update this question', 403);
    }

    // Update fields
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) {
      question.tags = tags.map(tag => tag.toLowerCase().trim());
    }

    await question.save();

    // Populate creator info
    await question.populate('createdBy', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: {
        question
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if user is the author or admin
    if (question.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to delete this question', 403);
    }

    // Delete associated answers
    await Answer.deleteMany({ questionId: id });

    // Delete the question
    await Question.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on question
// @route   POST /api/questions/:id/vote
// @access  Private
const voteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const question = await Question.findById(id);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if user is voting on their own question
    if (question.createdBy.toString() === req.user._id.toString()) {
      throw new AppError('Cannot vote on your own question', 400);
    }

    // Add or update vote
    question.addVote(req.user._id, value);
    await question.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voteCount: question.voteCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close/Open question
// @route   PATCH /api/questions/:id/close
// @access  Private
const toggleQuestionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if user is the author or admin
    if (question.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to modify this question', 403);
    }

    question.isClosed = !question.isClosed;
    await question.save();

    res.json({
      success: true,
      message: `Question ${question.isClosed ? 'closed' : 'opened'} successfully`,
      data: {
        isClosed: question.isClosed
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  toggleQuestionStatus
}; 