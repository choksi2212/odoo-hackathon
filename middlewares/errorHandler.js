const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      error: errors.join(', '),
      code: 400
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} already exists.`,
      code: 400
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format.',
      code: 400
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token.',
      code: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired.',
      code: 401
    });
  }

  // Custom error with code
  if (err.code) {
    return res.status(err.code).json({
      error: err.message,
      code: err.code
    });
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error.' 
      : err.message,
    code: 500
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

module.exports = { errorHandler, AppError }; 