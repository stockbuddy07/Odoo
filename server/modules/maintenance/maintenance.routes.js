// Maintenance Routes - Core ERP Module
const express = require('express');
const { body, param, query } = require('express-validator');
const MaintenanceController = require('./maintenance.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { requireManager, requireTechnician, canAccessResource } = require('../../middleware/role.middleware');
const { catchAsync } = require('../../middleware/error.middleware');

const router = express.Router();

// Validation rules
const createRequestValidation = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Subject must be between 5 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('equipment_id')
    .isInt({ min: 1 })
    .withMessage('Equipment ID must be a positive integer'),
  body('type')
    .optional()
    .isIn(['Corrective', 'Preventive'])
    .withMessage('Type must be either Corrective or Preventive'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  body('scheduled_date')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date')
];

const updateStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Request ID must be a positive integer'),
  body('status')
    .isIn(['New', 'In Progress', 'Repaired', 'Scrap'])
    .withMessage('Status must be New, In Progress, Repaired, or Scrap'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const assignTechnicianValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Request ID must be a positive integer'),
  body('technician_id')
    .isInt({ min: 1 })
    .withMessage('Technician ID must be a positive integer')
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
  query('status')
    .optional()
    .isIn(['New', 'In Progress', 'Repaired', 'Scrap'])
    .withMessage('Status must be New, In Progress, Repaired, or Scrap'),
  query('type')
    .optional()
    .isIn(['Corrective', 'Preventive'])
    .withMessage('Type must be Corrective or Preventive'),
  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  query('equipment_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Equipment ID must be a positive integer'),
  query('team_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Team ID must be a positive integer'),
  query('technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Technician ID must be a positive integer'),
  query('created_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Created by must be a positive integer'),
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
];

// Apply authentication to all maintenance routes
router.use(authenticateToken);

// Public routes (for all authenticated users)
router.get('/', queryValidation, catchAsync(MaintenanceController.getAllMaintenanceRequests));
router.get('/kanban', catchAsync(MaintenanceController.getKanbanData));
router.get('/stats', catchAsync(MaintenanceController.getMaintenanceStats));
router.get('/calendar', 
  query('dateFrom').isISO8601().withMessage('dateFrom must be a valid date'),
  query('dateTo').isISO8601().withMessage('dateTo must be a valid date'),
  catchAsync(MaintenanceController.getCalendarData)
);

// Routes requiring resource access check
router.get('/:id', 
  param('id').isInt({ min: 1 }).withMessage('Request ID must be a positive integer'),
  canAccessResource('maintenance'),
  catchAsync(MaintenanceController.getMaintenanceRequestById)
);

// User routes (can create requests)
router.post('/', createRequestValidation, catchAsync(MaintenanceController.createMaintenanceRequest));

// Technician routes (can update status if assigned)
router.put('/:id/status', 
  updateStatusValidation,
  canAccessResource('maintenance'),
  catchAsync(MaintenanceController.updateRequestStatus)
);

// Manager routes (can assign technicians and delete)
router.post('/:id/assign', 
  requireManager,
  assignTechnicianValidation,
  catchAsync(MaintenanceController.assignTechnician)
);

router.delete('/:id', 
  requireManager,
  param('id').isInt({ min: 1 }).withMessage('Request ID must be a positive integer'),
  catchAsync(MaintenanceController.deleteMaintenanceRequest)
);

module.exports = router;
