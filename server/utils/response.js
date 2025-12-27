// Standardized API Response Helper
const constants = require('../config/constants');

// Success response
const sendResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error response
const sendError = (res, statusCode, message = 'Error') => {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Pagination helper
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || constants.DEFAULTS.PAGE_SIZE;
  const offset = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    offset,
    totalPages: 0 // Will be calculated in controllers
  };
};

// Paginated response
const sendPaginatedResponse = (res, statusCode, data, pagination, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
};

// Logger utility
const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error ? error.stack || error : '');
  },
  
  warn: (message, data = null) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// Date utilities
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const formatDateTime = (date) => {
  return new Date(date).toISOString();
};

const isOverdue = (scheduledDate) => {
  const today = new Date();
  const scheduled = new Date(scheduledDate);
  return scheduled < today;
};

module.exports = {
  sendResponse,
  sendError,
  getPagination,
  sendPaginatedResponse,
  formatValidationErrors,
  logger,
  formatDate,
  formatDateTime,
  isOverdue
};
