const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { paginationValidation } = require('../middlewares/validation');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', auth, paginationValidation, getNotifications);

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', auth, getNotificationStats);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', auth, markAllAsRead);

// @route   DELETE /api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', auth, deleteAllNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', auth, markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, deleteNotification);

module.exports = router; 