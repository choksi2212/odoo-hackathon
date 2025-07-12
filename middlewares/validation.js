const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

// Validation rules for user registration
const registerValidation = [
  require('express-validator').body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  require('express-validator').body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  require('express-validator').body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate
];

// Validation rules for user login
const loginValidation = [
  require('express-validator').body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  require('express-validator').body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Validation rules for question creation
const questionValidation = [
  require('express-validator').body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  
  require('express-validator').body('description')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Description must be between 20 and 10000 characters'),
  
  require('express-validator').body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('Please provide 1-5 tags'),
  
  require('express-validator').body('tags.*')
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Tags can only contain letters, numbers, and hyphens'),
  
  validate
];

// Validation rules for answer creation
const answerValidation = [
  require('express-validator').body('content')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Answer must be between 20 and 10000 characters'),
  
  validate
];

// Validation rules for voting
const voteValidation = [
  require('express-validator').body('value')
    .isIn([1, -1])
    .withMessage('Vote value must be 1 (upvote) or -1 (downvote)'),
  
  validate
];

// Validation rules for pagination
const paginationValidation = [
  require('express-validator').query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  require('express-validator').query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  questionValidation,
  answerValidation,
  voteValidation,
  paginationValidation
}; 