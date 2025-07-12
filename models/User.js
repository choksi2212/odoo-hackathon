const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  reputation: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for questions
userSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'createdBy'
});

// Virtual for answers
userSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'createdBy'
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to hash password
userSchema.methods.hashPassword = async function(password) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

// Pre-save middleware to update lastActive
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ reputation: -1 });

module.exports = mongoose.model('User', userSchema); 