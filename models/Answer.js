const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    minlength: [20, 'Answer must be at least 20 characters long'],
    maxlength: [10000, 'Answer cannot exceed 10000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
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
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.votes.reduce((sum, vote) => sum + vote.value, 0);
});

// Method to add vote
answerSchema.methods.addVote = function(userId, value) {
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
answerSchema.methods.removeVote = function(userId) {
  this.votes = this.votes.filter(vote => 
    vote.userId.toString() !== userId.toString()
  );
};

// Method to accept answer
answerSchema.methods.accept = function() {
  this.isAccepted = true;
};

// Method to unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
};

// Method to edit answer with history
answerSchema.methods.edit = function(newContent) {
  // Save current content to history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });

  // Update content
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Pre-save middleware to validate content
answerSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content.length < 20) {
    return next(new Error('Answer must be at least 20 characters long'));
  }
  next();
});

// Indexes for better query performance
answerSchema.index({ questionId: 1 });
answerSchema.index({ createdBy: 1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ createdAt: -1 });
answerSchema.index({ 'votes.value': -1 });

module.exports = mongoose.model('Answer', answerSchema); 