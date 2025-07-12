const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        code: 401
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token. User not found.',
        code: 401
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: 'Account is banned. Please contact support.',
        code: 403
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.',
        code: 401
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired.',
        code: 401
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error.',
      code: 500
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied. Admin privileges required.',
          code: 403
        });
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { auth, optionalAuth, adminAuth }; 