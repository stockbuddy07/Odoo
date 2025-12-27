// Authentication Routes
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('./auth.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { requireAdmin, requireManager } = require('../../middleware/role.middleware');
const { catchAsync } = require('../../middleware/error.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password_hash'),
  body('role_id')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Role ID must be between 1 and 4')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password_hash')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, catchAsync(AuthController.register));
router.post('/login', loginValidation, catchAsync(AuthController.login));

// Protected routes (require authentication)
router.post('/logout', authenticateToken, catchAsync(AuthController.logout));
router.get('/profile', authenticateToken, catchAsync(AuthController.getProfile));
router.put('/profile', authenticateToken, updateProfileValidation, catchAsync(AuthController.updateProfile));
router.put('/change-password', authenticateToken, changePasswordValidation, catchAsync(AuthController.changePassword));
router.get('/verify-token', authenticateToken, catchAsync(AuthController.verifyToken));

// Admin/Manager only routes (for user management)
router.get('/users', authenticateToken, requireManager, catchAsync(async (req, res) => {
  // This would be implemented in a separate users controller
  res.status(501).json({
    success: false,
    message: 'User management endpoints not yet implemented'
  });
}));

module.exports = router;
