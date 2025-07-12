const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['answer', 'accept', 'vote', 'mention', 'bounty', 'admin'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  link: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  relatedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.read = false;
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return new this({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link,
    relatedQuestion: data.relatedQuestion,
    relatedAnswer: data.relatedAnswer,
    relatedUser: data.relatedUser,
    metadata: data.metadata || {}
  });
};

// Indexes for better query performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 