// Teams Controller
const { validationResult } = require('express-validator');
const TeamService = require('./team.service');
const { executeQuery } = require('../../config/db.config');
const { sendResponse, sendError, sendPaginatedResponse, logger } = require('../../utils/response');
const { catchAsync, AppError } = require('../../middleware/error.middleware');
const constants = require('../../config/constants');

class TeamController {
  // Get all teams
  static getAllTeams = catchAsync(async (req, res) => {
    const queryOptions = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };

    try {
      const result = await TeamService.getAllTeams(queryOptions);

      return sendPaginatedResponse(
        res, 
        constants.RESPONSE_CODES.SUCCESS, 
        result.teams, 
        result.pagination, 
        'Teams retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  });

  // Get team by ID
  static getTeamById = catchAsync(async (req, res) => {
    const teamId = parseInt(req.params.id);

    if (isNaN(teamId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid team ID');
    }

    try {
      const team = await TeamService.getTeamById(teamId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, team, 'Team retrieved successfully');
    } catch (error) {
      if (error.message === 'Team not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Create new team
  static createTeam = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const teamData = req.body;

    try {
      const team = await TeamService.createTeam(teamData);

      return sendResponse(res, constants.RESPONSE_CODES.CREATED, team, 'Team created successfully');
    } catch (error) {
      if (error.message === 'Team with this name already exists') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      throw error;
    }
  });

  // Update team
  static updateTeam = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const teamId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(teamId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid team ID');
    }

    try {
      const team = await TeamService.updateTeam(teamId, updateData);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, team, 'Team updated successfully');
    } catch (error) {
      if (error.message === 'Team not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message === 'Team with this name already exists') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      if (error.message === 'No valid fields to update') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      throw error;
    }
  });

  // Add team member
  static addTeamMember = catchAsync(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(constants.RESPONSE_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const teamId = parseInt(req.params.id);
    const { user_id, is_lead = false } = req.body;

    if (isNaN(teamId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid team ID');
    }

    if (!user_id || isNaN(user_id)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Valid user ID is required');
    }

    try {
      const member = await TeamService.addTeamMember(teamId, user_id, is_lead);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, member, 'Team member added successfully');
    } catch (error) {
      if (error.message === 'Team not found or inactive') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      if (error.message === 'User not found or inactive') {
        return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, error.message);
      }
      if (error.message === 'User is already a member of this team') {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, error.message);
      }
      throw error;
    }
  });

  // Remove team member
  static removeTeamMember = catchAsync(async (req, res) => {
    const membershipId = parseInt(req.params.membershipId);

    if (isNaN(membershipId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid membership ID');
    }

    try {
      const result = await TeamService.removeTeamMember(membershipId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, result, result.message);
    } catch (error) {
      if (error.message === 'Team membership not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Make team lead
  static makeTeamLead = catchAsync(async (req, res) => {
    const membershipId = parseInt(req.params.membershipId);

    if (isNaN(membershipId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid membership ID');
    }

    try {
      const member = await TeamService.makeTeamLead(membershipId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, member, 'Team lead assigned successfully');
    } catch (error) {
      if (error.message === 'Team membership not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Remove team lead
  static removeTeamLead = catchAsync(async (req, res) => {
    const membershipId = parseInt(req.params.membershipId);

    if (isNaN(membershipId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid membership ID');
    }

    try {
      const result = await TeamService.removeTeamLead(membershipId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, result, result.message);
    } catch (error) {
      if (error.message === 'Team membership not found') {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, error.message);
      }
      throw error;
    }
  });

  // Get team statistics
  static getTeamStats = catchAsync(async (req, res) => {
    try {
      const stats = await TeamService.getTeamStats();

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, stats, 'Team statistics retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Get team options for dropdowns
  static getTeamOptions = catchAsync(async (req, res) => {
    try {
      const teams = await TeamService.getTeamOptions();

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, teams, 'Team options retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Get team technicians
  static getTeamTechnicians = catchAsync(async (req, res) => {
    const teamId = parseInt(req.params.id);

    if (isNaN(teamId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid team ID');
    }

    try {
      const technicians = await TeamService.getTeamTechnicians(teamId);

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, technicians, 'Team technicians retrieved successfully');
    } catch (error) {
      throw error;
    }
  });

  // Delete team (Admin/Manager only)
  static deleteTeam = catchAsync(async (req, res) => {
    const teamId = parseInt(req.params.id);

    if (isNaN(teamId)) {
      return sendError(res, constants.RESPONSE_CODES.BAD_REQUEST, 'Invalid team ID');
    }

    try {
      // Check if team exists
      const team = await executeQuery(
        'SELECT id FROM maintenance_teams WHERE id = ?',
        [teamId]
      );

      if (team.length === 0) {
        return sendError(res, constants.RESPONSE_CODES.NOT_FOUND, 'Team not found');
      }

      // Check if team has active equipment assignments
      const equipmentCount = await executeQuery(
        'SELECT COUNT(*) as count FROM equipment WHERE maintenance_team_id = ?',
        [teamId]
      );

      if (equipmentCount[0].count > 0) {
        return sendError(res, constants.RESPONSE_CODES.CONFLICT, 'Cannot delete team with assigned equipment');
      }

      // Remove all team memberships first
      await executeQuery('DELETE FROM team_members WHERE team_id = ?', [teamId]);
      
      // Delete the team
      await executeQuery('DELETE FROM maintenance_teams WHERE id = ?', [teamId]);

      logger.info('Team deleted', { teamId });

      return sendResponse(res, constants.RESPONSE_CODES.SUCCESS, null, 'Team deleted successfully');
    } catch (error) {
      logger.error('Delete team error', error);
      throw error;
    }
  });
}

module.exports = TeamController;
