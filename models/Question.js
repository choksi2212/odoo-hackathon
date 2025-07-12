const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Question description is required'],
    minlength: [20, 'Description must be at least 20 characters long'],
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isClosed: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  bounty: {
    type: Number,
    default: 0,
    min: [0, 'Bounty cannot be negative']
  },
  bountyExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for answers
questionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'questionId'
});

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.votes.reduce((sum, vote) => sum + vote.value, 0);
});

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers ? this.answers.length : 0;
});

// Method to add vote
questionSchema.methods.addVote = function(userId, value) {
  const existingVoteIndex = this.votes.findIndex(vote => 
    vote.userId.toString() === userId.toString()
  );

  if (existingVoteIndex !== -1) {
    // Update existing vote
    this.votes[existingVoteIndex].value = value;
    this.votes[existingVoteIndex].createdAt = new Date();
  } else {
    // Add new vote
    this.votes.push({ userId, value });
  }
};

// Method to remove vote
questionSchema.methods.removeVote = function(userId) {
  this.votes = this.votes.filter(vote => 
    vote.userId.toString() !== userId.toString()
  );
};

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
};

// Pre-save middleware to validate tags
questionSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 5) {
    return next(new Error('Maximum 5 tags allowed'));
  }
  next();
});

// Indexes for better query performance
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ 'votes.value': -1 });

module.exports = mongoose.model('Question', questionSchema); 