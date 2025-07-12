const express = require('express');
const router = express.Router();
const { paginationValidation } = require('../middlewares/validation');
const {
  getTags,
  getQuestionsByTag,
  getPopularTags,
  searchTags
} = require('../controllers/tagController');

// @route   GET /api/tags
// @desc    Get all tags with usage count
// @access  Public
router.get('/', paginationValidation, getTags);

// @route   GET /api/tags/popular
// @desc    Get popular tags
// @access  Public
router.get('/popular', getPopularTags);

// @route   GET /api/tags/search/:query
// @desc    Search tags
// @access  Public
router.get('/search/:query', searchTags);

// @route   GET /api/tags/:tag
// @desc    Get questions by tag
// @access  Public
router.get('/:tag', paginationValidation, getQuestionsByTag);

module.exports = router; 