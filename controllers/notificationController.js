const Notification = require('../models/Notification');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { unreadOnly = false } = req.query;

    // Build query
    let query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedQuestion', 'title')
      .populate('relatedAnswer', 'content')
      .populate('relatedUser', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
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

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to access this notification', 403);
    }

    notification.markAsRead();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to delete this notification', 403);
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All notifications deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res, next) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: ['$read', 0, 1] }
          }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          unreadCount: 1
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments({ userId: req.user._id });
    const totalUnread = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({
      success: true,
      data: {
        stats,
        total: totalNotifications,
        unread: totalUnread
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
}; 