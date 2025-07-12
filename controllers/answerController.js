const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Create new answer
// @route   POST /api/answers/:questionId
// @access  Private
const createAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if question is closed
    if (question.isClosed) {
      throw new AppError('Cannot answer a closed question', 400);
    }

    // Check if user has already answered this question
    const existingAnswer = await Answer.findOne({
      questionId,
      createdBy: req.user._id
    });

    if (existingAnswer) {
      throw new AppError('You have already answered this question', 400);
    }

    const answer = new Answer({
      questionId,
      content,
      createdBy: req.user._id
    });

    await answer.save();

    // Populate creator info
    await answer.populate('createdBy', 'username reputation avatar');

    // Create notification for question owner
    if (question.createdBy.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        userId: question.createdBy,
        type: 'answer',
        title: 'New answer to your question',
        message: `${req.user.username} answered your question "${question.title}"`,
        link: `/questions/${questionId}`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id,
        relatedUser: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      data: {
        answer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update answer
// @route   PATCH /api/answers/:id
// @access  Private
const updateAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(id);

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    // Check if user is the author or admin
    if (answer.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to update this answer', 403);
    }

    // Edit answer with history
    answer.edit(content);
    await answer.save();

    // Populate creator info
    await answer.populate('createdBy', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: {
        answer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    // Check if user is the author or admin
    if (answer.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to delete this answer', 403);
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
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept/Unaccept answer
// @route   PATCH /api/answers/:id/accept
// @access  Private
const acceptAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    const question = await Question.findById(answer.questionId);

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if user is the question owner or admin
    if (question.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Only the question owner can accept answers', 403);
    }

    // If answer is already accepted, unaccept it
    if (answer.isAccepted) {
      answer.unaccept();
      question.acceptedAnswer = null;
      
      // Create notification for answer owner
      await Notification.createNotification({
        userId: answer.createdBy,
        type: 'accept',
        title: 'Answer unaccepted',
        message: `Your answer to "${question.title}" was unaccepted`,
        link: `/questions/${question._id}`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id,
        relatedUser: req.user._id
      });
    } else {
      // Unaccept any previously accepted answer
      if (question.acceptedAnswer) {
        const previousAccepted = await Answer.findById(question.acceptedAnswer);
        if (previousAccepted) {
          previousAccepted.unaccept();
          await previousAccepted.save();
        }
      }

      // Accept this answer
      answer.accept();
      question.acceptedAnswer = answer._id;

      // Create notification for answer owner
      await Notification.createNotification({
        userId: answer.createdBy,
        type: 'accept',
        title: 'Answer accepted!',
        message: `Your answer to "${question.title}" was accepted!`,
        link: `/questions/${question._id}`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id,
        relatedUser: req.user._id
      });
    }

    await answer.save();
    await question.save();

    res.json({
      success: true,
      message: `Answer ${answer.isAccepted ? 'accepted' : 'unaccepted'} successfully`,
      data: {
        isAccepted: answer.isAccepted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
const voteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const answer = await Answer.findById(id);

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    // Check if user is voting on their own answer
    if (answer.createdBy.toString() === req.user._id.toString()) {
      throw new AppError('Cannot vote on your own answer', 400);
    }

    // Add or update vote
    answer.addVote(req.user._id, value);
    await answer.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voteCount: answer.voteCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get answer by ID
// @route   GET /api/answers/:id
// @access  Public
const getAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id)
      .populate('createdBy', 'username reputation avatar')
      .populate('votes.userId', 'username')
      .populate('questionId', 'title');

    if (!answer) {
      throw new AppError('Answer not found', 404);
    }

    res.json({
      success: true,
      data: {
        answer
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  voteAnswer,
  getAnswer
}; 