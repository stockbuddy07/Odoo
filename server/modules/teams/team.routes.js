// Teams Routes
const express = require('express');
const { body, param, query } = require('express-validator');
const TeamController = require('./team.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { requireManager } = require('../../middleware/role.middleware');
const { catchAsync } = require('../../middleware/error.middleware');

const router = express.Router();

// Validation rules
const createTeamValidation = [
  body('team_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const updateTeamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Team ID must be a positive integer'),
  body('team_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

const addMemberValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Team ID must be a positive integer'),
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('is_lead')
    .optional()
    .isBoolean()
    .withMessage('is_lead must be a boolean value')
];

const membershipIdValidation = [
  param('membershipId')
    .isInt({ min: 1 })
    .withMessage('Membership ID must be a positive integer')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Apply authentication to all team routes
router.use(authenticateToken);

// Public routes (for all authenticated users)
router.get('/', queryValidation, catchAsync(TeamController.getAllTeams));
router.get('/stats', catchAsync(TeamController.getTeamStats));
router.get('/options', catchAsync(TeamController.getTeamOptions));
router.get('/:id', 
  param('id').isInt({ min: 1 }).withMessage('Team ID must be a positive integer'),
  catchAsync(TeamController.getTeamById)
);
router.get('/:id/technicians', 
  param('id').isInt({ min: 1 }).withMessage('Team ID must be a positive integer'),
  catchAsync(TeamController.getTeamTechnicians)
);

// Manager routes (create, update, delete, manage members)
router.post('/', requireManager, createTeamValidation, catchAsync(TeamController.createTeam));
router.put('/:id', requireManager, updateTeamValidation, catchAsync(TeamController.updateTeam));
router.delete('/:id', 
  requireManager,
  param('id').isInt({ min: 1 }).withMessage('Team ID must be a positive integer'),
  catchAsync(TeamController.deleteTeam)
);

// Team member management routes
router.post('/:id/members', 
  requireManager, 
  addMemberValidation, 
  catchAsync(TeamController.addTeamMember)
);
router.delete('/members/:membershipId', 
  requireManager,
  membershipIdValidation,
  catchAsync(TeamController.removeTeamMember)
);

// Team lead management routes
router.put('/members/:membershipId/lead', 
  requireManager,
  membershipIdValidation,
  catchAsync(TeamController.makeTeamLead)
);
router.put('/members/:membershipId/remove-lead', 
  requireManager,
  membershipIdValidation,
  catchAsync(TeamController.removeTeamLead)
);

module.exports = router;
