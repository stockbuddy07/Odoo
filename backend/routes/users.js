const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getProfile,
  updateProfile,
  getDashboard,
  deleteAccount,
  changePassword,
  validateProfileUpdate
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for user endpoints
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all user routes
router.use(userLimiter);

// All user routes require authentication
router.use(authenticateToken);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
// @body    { firstName?, lastName?, phone?, address?, bio?, avatarUrl? }
router.put('/profile', validateProfileUpdate, updateProfile);

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', getDashboard);

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
// @body    { currentPassword, newPassword }
router.post('/change-password', (req, res) => {
  // Simple validation without express-validator for password change
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }

  // Call the controller function
  changePassword(req, res);
});

// @route   DELETE /api/users/account
// @desc    Delete user account (soft delete)
// @access  Private
router.delete('/account', deleteAccount);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = await user.getProfile();
    
    const stats = {
      accountCreated: userProfile.createdAt,
      profileComplete: !!(userProfile.phone && userProfile.address),
      hasBio: !!userProfile.bio,
      hasAvatar: !!userProfile.avatarUrl
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
