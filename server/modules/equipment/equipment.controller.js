// Equipment Controller
const { validationResult } = require('express-validator');
const EquipmentService = require('./equipment.service');
const { sendResponse, sendError, sendPaginatedResponse } = require('../../utils/response');
const { catchAsync, AppError } = require('../../middleware/error.middleware');
const constants = require('../../config/constants');

class EquipmentController {
  // Get all equipment
  static getAllEquipment = catchAsync(async (req, res) => {
    const queryOptions = {
      page: req.query.page,
      limit: req.query.limit,
      department: req.query.department,
      maintenance_team_id: req.query.maintenance_team_id,
      is_scrapped: req.query.is_scrapped !== undefined ? req.query.is_scrapped === 'true' : undefined,
      search: req.query.search
    };

    try {
      const result = await EquipmentService.getAllEquipment(queryOptions);

      return sendPaginatedResponse(
        res, 
        constants.RESPONSE_CODES.SUCCESS, 
        result.equipment, 
        result.pagination, 
        'Equipment retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  });

  // Get equipment by ID
  static getEquipmentById = catchAsync(async (req, res) => {
    const equipmentId = parseInt(req.params.id);

    if (isNaN(equipmentId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid equipment ID');
    }

    try {
      const equipment = await EquipmentService.getEquipmentById(equipmentId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, equipment, 'Equipment retrieved successfully');
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Create new equipment
  static createEquipment = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const equipmentData = req.body;

    try {
      const equipment = await EquipmentService.createEquipment(equipmentData);

      return sendResponse(res, constants.RESPONSE_CODES.CREATED, equipment, 'Equipment created successfully');
    } catch (error) {
      if (error.message === 'Equipment with this serial number already exists') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      if (error.message === 'Maintenance team not found') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Update equipment
  static updateEquipment = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const equipmentId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(equipmentId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid equipment ID');
    }

    try {
      const equipment = await EquipmentService.updateEquipment(equipmentId, updateData);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, equipment, 'Equipment updated successfully');
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message === 'Equipment with this serial number already exists') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      if (error.message === 'No valid fields to update') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Delete equipment
  static deleteEquipment = catchAsync(async (req, res) => {
    const equipmentId = parseInt(req.params.id);

    if (isNaN(equipmentId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid equipment ID');
    }

    try {
      const result = await EquipmentService.deleteEquipment(equipmentId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, result, result.message);
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message === 'Cannot delete equipment with active maintenance requests') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      throw error;
    }
  });

  // Get equipment statistics
  static getEquipmentStats = catchAsync(async (req, res) => {
    try {
      const stats = await EquipmentService.getEquipmentStats();

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, stats, 'Equipment statistics retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Get equipment for dropdown/select
  static getEquipmentOptions = catchAsync(async (req, res) => {
    try {
      // Get active, non-scrapped equipment for dropdowns
      const equipment = await EquipmentService.getAllEquipment({
        is_scrapped: false,
        limit: 1000 // Get all for dropdown
      });

      const options = equipment.equipment.map(item => ({
        value: item.id,
        label: `${item.name} (${item.serial_number})`,
        department: item.department,
        team_id: item.team_id,
        team_name: item.team_name
      }));

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, options, 'Equipment options retrieved successfully');
    } catch (error) {
      throw error;
    }
  });
}

module.exports = EquipmentController;
