const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middlewares/auth');
const { questionValidation, voteValidation, paginationValidation } = require('../middlewares/validation');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  toggleQuestionStatus
} = require('../controllers/questionController');

// @route   GET /api/questions
// @desc    Get all questions with pagination and filters
// @access  Public
router.get('/', paginationValidation, optionalAuth, getQuestions);

// @route   GET /api/questions/:id
// @desc    Get single question by ID
// @access  Public
router.get('/:id', optionalAuth, getQuestion);

// @route   POST /api/questions
// @desc    Create new question
// @access  Private
router.post('/', auth, questionValidation, createQuestion);

// @route   PATCH /api/questions/:id
// @desc    Update question
// @access  Private
router.patch('/:id', auth, questionValidation, updateQuestion);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private
router.delete('/:id', auth, deleteQuestion);

// @route   POST /api/questions/:id/vote
// @desc    Vote on question
// @access  Private
router.post('/:id/vote', auth, voteValidation, voteQuestion);

// @route   PATCH /api/questions/:id/close
// @desc    Close/Open question
// @access  Private
router.patch('/:id/close', auth, toggleQuestionStatus);

module.exports = router; 