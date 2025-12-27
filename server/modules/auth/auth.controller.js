// Authentication Controller
const { validationResult } = require('express-validator');
const AuthService = require('./auth.service');
const { sendResponse, sendError, formatValidationErrors } = require('../../utils/response');
const { catchAsync, AppError } = require('../../middleware/error.middleware');
const constants = require('../../config/constants');

class AuthController {
  // Register new user
  static register = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: formatValidationErrors(errors)
      });
    }

    const { name, email, password, role_id } = req.body;

    try {
      const result = await AuthService.register({
        name,
        email,
        password,
        role_id
      });

      return sendResponse(res, constants.RESPONSE_CODES.CREATED, result, 'User registered successfully');
    } catch (error) {
      if (error.message === constants.MESSAGES.DUPLICATE_EMAIL) {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      throw error;
    }
  });

  // Login user
  static login = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: formatValidationErrors(errors)
      });
    }

    const { email, password } = req.body;

    try {
      const result = await AuthService.login(email, password);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, result, 'Login successful');
    } catch (error) {
      if (error.message === constants.MESSAGES.INVALID_CREDENTIALS) {
        return sendError(res, constants.RESPONSE_CODES.UNAUTHORIZED, error.message);
      }
      throw error;
    }
  });

  // Get user profile
  static getProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;

    try {
      const profile = await AuthService.getProfile(userId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, profile, 'Profile retrieved successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Update user profile
  static updateProfile = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: formatValidationErrors(errors)
      });
    }

    const userId = req.user.id;
    const { name, email } = req.body;

    try {
      const updatedProfile = await AuthService.updateProfile(userId, { name, email });

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, updatedProfile, 'Profile updated successfully');
    } catch (error) {
      if (error.message === constants.MESSAGES.DUPLICATE_EMAIL) {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      throw error;
    }
  });

  // Change password
  static changePassword = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: formatValidationErrors(errors)
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, result, result.message);
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Logout (client-side token removal)
  static logout = catchAsync(async (req, res) => {
    // In a stateless JWT implementation, logout is handled client-side
    // We can add token to blacklist here if needed for enhanced security
    
    return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, null, 'Logout successful');
  });

  // Verify token
  static verifyToken = catchAsync(async (req, res) => {
    // If we reach here, the token is valid (middleware verified it)
    const user = await AuthService.getProfile(req.user.id);

    return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        role_id: user.role_id
      },
      valid: true
    }, 'Token is valid');
  });
}

module.exports = AuthController;
