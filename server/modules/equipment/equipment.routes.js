// Equipment Routes
const express = require('express');
const { body, param, query } = require('express-validator');
const EquipmentController = require('./equipment.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { requireManager, requireTechnician } = require('../../middleware/role.middleware');
const { catchAsync } = require('../../middleware/error.middleware');
const constants = require('../../config/constants');

const router = express.Router();

// Validation rules
const createEquipmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('serial_number')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Serial number is required and must be less than 50 characters'),
  body('department')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Department is required and must be less than 50 characters'),
  body('assigned_employee')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assigned employee must be less than 100 characters'),
  body('purchase_date')
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('warranty_end')
    .optional()
    .isISO8601()
    .withMessage('Warranty end must be a valid date'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required and must be less than 100 characters'),
  body('maintenance_team_id')
    .isInt({ min: 1 })
    .withMessage('Maintenance team ID must be a positive integer')
];

const updateEquipmentValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Equipment ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('serial_number')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Serial number must be less than 50 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Department must be less than 50 characters'),
  body('assigned_employee')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assigned employee must be less than 100 characters'),
  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('warranty_end')
    .optional()
    .isISO8601()
    .withMessage('Warranty end must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('maintenance_team_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maintenance team ID must be a positive integer'),
  body('is_scrapped')
    .optional()
    .isBoolean()
    .withMessage('is_scrapped must be a boolean value')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: constants?.DEFAULTS?.MAX_PAGE_SIZE || 100 })
    .withMessage(`Limit must be between 1 and ${constants?.DEFAULTS?.MAX_PAGE_SIZE || 100}`),
  query('department')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department must be less than 50 characters'),
  query('maintenance_team_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maintenance team ID must be a positive integer'),
  query('is_scrapped')
    .optional()
    .isBoolean()
    .withMessage('is_scrapped must be a boolean value'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
];

// Apply authentication to all equipment routes
router.use(authenticateToken);

// Public equipment routes (for all authenticated users)
router.get('/', queryValidation, catchAsync(EquipmentController.getAllEquipment));
router.get('/options', catchAsync(EquipmentController.getEquipmentOptions));
router.get('/stats', catchAsync(EquipmentController.getEquipmentStats));
router.get('/:id', 
  param('id').isInt({ min: 1 }).withMessage('Equipment ID must be a positive integer'),
  catchAsync(EquipmentController.getEquipmentById)
);

// Admin/Manager only routes
router.post('/', requireManager, createEquipmentValidation, catchAsync(EquipmentController.createEquipment));
router.put('/:id', requireManager, updateEquipmentValidation, catchAsync(EquipmentController.updateEquipment));
router.delete('/:id', 
  requireManager,
  param('id').isInt({ min: 1 }).withMessage('Equipment ID must be a positive integer'),
  catchAsync(EquipmentController.deleteEquipment)
);

module.exports = router;
