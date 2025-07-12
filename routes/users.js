const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { paginationValidation } = require('../middlewares/validation');
const {
  getUserProfile,
  getMyQuestions,
  getMyAnswers,
  searchUsers,
  getTopUsers
} = require('../controllers/userController');

// @route   GET /api/users/top
// @desc    Get top users by reputation
// @access  Public
router.get('/top', getTopUsers);

// @route   GET /api/users/search/:query
// @desc    Search users
// @access  Public
router.get('/search/:query', paginationValidation, searchUsers);

// @route   GET /api/users/me/questions
// @desc    Get current user's questions
// @access  Private
router.get('/me/questions', auth, paginationValidation, getMyQuestions);

// @route   GET /api/users/me/answers
// @desc    Get current user's answers
// @access  Private
router.get('/me/answers', auth, paginationValidation, getMyAnswers);

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', paginationValidation, getUserProfile);

module.exports = router; 