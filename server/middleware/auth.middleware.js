// JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const { testConnection } = require('../config/db.config');
const constants = require('../config/constants');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(constants.RESPONSE_CODES.UNAUTHORIZED).json({
        success: false,
        message: constants.MESSAGES.TOKEN_REQUIRED
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
      role_id: decoded.role_id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(constants.RESPONSE_CODES.UNAUTHORIZED).json({
        success: false,
        message: constants.MESSAGES.TOKEN_INVALID
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(constants.RESPONSE_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(constants.RESPONSE_CODES.SERVER_ERROR).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
        role_id: decoded.role_id
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
