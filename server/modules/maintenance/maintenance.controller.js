// Maintenance Controller - Core ERP Module
const { validationResult } = require('express-validator');
const MaintenanceService = require('./maintenance.service');
const { executeQuery } = require('../../config/db.config');
const { sendResponse, sendError, sendPaginatedResponse, logger } = require('../../utils/response');
const { catchAsync, AppError } = require('../../middleware/error.middleware');
const constants = require('../../config/constants');

class MaintenanceController {
  // Get all maintenance requests
  static getAllMaintenanceRequests = catchAsync(async (req, res) => {
    const queryOptions = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      type: req.query.type,
      priority: req.query.priority,
      equipment_id: req.query.equipment_id,
      team_id: req.query.team_id,
      technician_id: req.query.technician_id,
      created_by: req.query.created_by,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      search: req.query.search
    };

    try {
      const result = await MaintenanceService.getAllMaintenanceRequests(queryOptions);

      return sendPaginatedResponse(
        res, 
        constants.RESPONSE_CODES.SUCCESS, 
        result.requests, 
        result.pagination, 
        'Maintenance requests retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  });

  // Get Kanban board data
  static getKanbanData = catchAsync(async (req, res) => {
    const filters = {
      team_id: req.query.team_id,
      technician_id: req.query.technician_id
    };

    try {
      const kanbanData = await MaintenanceService.getKanbanData(filters);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, kanbanData, 'Kanban data retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Get calendar data for preventive maintenance
  static getCalendarData = catchAsync(async (req, res) => {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Date range is required');
    }

    try {
      const events = await MaintenanceService.getCalendarData(dateFrom, dateTo);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, events, 'Calendar data retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Get maintenance request by ID
  static getMaintenanceRequestById = catchAsync(async (req, res) => {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid request ID');
    }

    try {
      const request = await MaintenanceService.getMaintenanceRequestById(requestId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, request, 'Maintenance request retrieved successfully');
    } catch (error) {
      if (error.message === 'Maintenance request not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Create maintenance request
  static createMaintenanceRequest = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const requestData = req.body;
    const userId = req.user.id;

    try {
      const request = await MaintenanceService.createMaintenanceRequest(requestData, userId);

      return sendResponse(res, constants.RESPONSE_CODES.CREATED, request, 'Maintenance request created successfully');
    } catch (error) {
      if (error.message === 'Equipment not found or scrapped') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Update maintenance request status (for Kanban)
  static updateRequestStatus = catchAsync(async (req, res) => {
    const requestId = parseInt(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user.id;

    if (isNaN(requestId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid request ID');
    }

    if (!status || !Object.values(constants.STATUS).includes(status)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Valid status is required');
    }

    try {
      const request = await MaintenanceService.updateRequestStatus(requestId, status, userId, notes);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, request, 'Request status updated successfully');
    } catch (error) {
      if (error.message === 'Maintenance request not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message.includes('Invalid status transition')) {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Assign technician to request
  static assignTechnician = catchAsync(async (req, res) => {
    const requestId = parseInt(req.params.id);
    const { technician_id } = req.body;
    const assignedBy = req.user.id;

    if (isNaN(requestId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid request ID');
    }

    if (!technician_id || isNaN(technician_id)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Valid technician ID is required');
    }

    try {
      const request = await MaintenanceService.assignTechnician(requestId, technician_id, assignedBy);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, request, 'Technician assigned successfully');
    } catch (error) {
      if (error.message === 'Maintenance request not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message === 'Technician not found or inactive') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      if (error.message === 'Technician does not belong to the assigned team') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Get maintenance statistics
  static getMaintenanceStats = catchAsync(async (req, res) => {
    try {
      // Get overview statistics
      const overviewStats = await executeQuery(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'New' THEN 1 END) as new_requests,
          COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_requests,
          COUNT(CASE WHEN status = 'Repaired' THEN 1 END) as repaired_requests,
          COUNT(CASE WHEN status = 'Scrap' THEN 1 END) as scrap_requests,
          COUNT(CASE WHEN type = 'Corrective' THEN 1 END) as corrective_requests,
          COUNT(CASE WHEN type = 'Preventive' THEN 1 END) as preventive_requests
        FROM maintenance_requests
      `);

      // Get requests by priority
      const byPriority = await executeQuery(`
        SELECT 
          priority,
          COUNT(*) as count,
          COUNT(CASE WHEN status != 'Repaired' AND status != 'Scrap' THEN 1 END) as active_count
        FROM maintenance_requests
        GROUP BY priority
        ORDER BY 
          CASE priority 
            WHEN 'Critical' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
          END
      `);

      // Get overdue preventive maintenance
      const overdue = await executeQuery(`
        SELECT 
          COUNT(*) as overdue_count
        FROM maintenance_requests
        WHERE type = 'Preventive'
        AND scheduled_date < CURDATE()
        AND status != 'Repaired'
      `);

      // Get recent activity
      const recentActivity = await executeQuery(`
        SELECT 
          mr.id,
          mr.subject,
          mr.status,
          mr.updated_at,
          e.name as equipment_name,
          mt.team_name
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        ORDER BY mr.updated_at DESC
        LIMIT 5
      `);

      const stats = {
        overview: overviewStats[0],
        by_priority: byPriority,
        overdue_preventive: overdue[0].overdue_count,
        recent_activity: recentActivity
      };

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, stats, 'Maintenance statistics retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Delete maintenance request (Admin/Manager only)
  static deleteMaintenanceRequest = catchAsync(async (req, res) => {
    const requestId = parseInt(req.params.id);

    if (isNaN(requestId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid request ID');
    }

    try {
      // Check if request exists and can be deleted
      const request = await executeQuery(
        'SELECT status FROM maintenance_requests WHERE id = ?',
        [requestId]
      );

      if (request.length === 0) {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, 'Maintenance request not found');
      }

      // Don't allow deletion of completed requests (good practice)
      if (['Repaired', 'Scrap'].includes(request[0].status)) {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, 'Cannot delete completed maintenance requests');
      }

      // Delete associated logs first
      await executeQuery('DELETE FROM maintenance_logs WHERE request_id = ?', [requestId]);
      
      // Delete the request
      await executeQuery('DELETE FROM maintenance_requests WHERE id = ?', [requestId]);

      logger.info('Maintenance request deleted', { requestId });

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, null, 'Maintenance request deleted successfully');
    } catch (error) {
      logger.error('Delete maintenance request error', error);
      throw error;
    }
  });
}

module.exports = MaintenanceController;
