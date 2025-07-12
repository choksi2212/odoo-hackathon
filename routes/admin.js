const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/auth');
const { paginationValidation } = require('../middlewares/validation');
const {
  getQuestionsForModeration,
  getAnswersForModeration,
  toggleUserBan,
  getPlatformStats,
  deleteQuestionAdmin,
  deleteAnswerAdmin,
  getAllUsers
} = require('../controllers/adminController');

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', adminAuth, getPlatformStats);

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Admin
router.get('/users', adminAuth, paginationValidation, getAllUsers);

// @route   GET /api/admin/questions
// @desc    Get all questions for moderation
// @access  Admin
router.get('/questions', adminAuth, paginationValidation, getQuestionsForModeration);

// @route   GET /api/admin/answers
// @desc    Get all answers for moderation
// @access  Admin
router.get('/answers', adminAuth, paginationValidation, getAnswersForModeration);

// @route   PATCH /api/admin/ban/:userId
// @desc    Ban/Unban user
// @access  Admin
router.patch('/ban/:userId', adminAuth, toggleUserBan);

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question (admin)
// @access  Admin
router.delete('/questions/:id', adminAuth, deleteQuestionAdmin);

// @route   DELETE /api/admin/answers/:id
// @desc    Delete answer (admin)
// @access  Admin
router.delete('/answers/:id', adminAuth, deleteAnswerAdmin);

module.exports = router; 