const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { answerValidation, voteValidation } = require('../middlewares/validation');
const {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  voteAnswer,
  getAnswer
} = require('../controllers/answerController');

// @route   POST /api/answers/:questionId
// @desc    Create new answer
// @access  Private
router.post('/:questionId', auth, answerValidation, createAnswer);

// @route   GET /api/answers/:id
// @desc    Get answer by ID
// @access  Public
router.get('/:id', getAnswer);

// @route   PATCH /api/answers/:id
// @desc    Update answer
// @access  Private
router.patch('/:id', auth, answerValidation, updateAnswer);

// @route   DELETE /api/answers/:id
// @desc    Delete answer
// @access  Private
router.delete('/:id', auth, deleteAnswer);

// @route   PATCH /api/answers/:id/accept
// @desc    Accept/Unaccept answer
// @access  Private
router.patch('/:id/accept', auth, acceptAnswer);

// @route   POST /api/answers/:id/vote
// @desc    Vote on answer
// @access  Private
router.post('/:id/vote', auth, voteValidation, voteAnswer);

module.exports = router; 