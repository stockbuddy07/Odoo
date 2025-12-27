// Teams Service
const { executeQuery } = require('../../config/db.config');
const { logger } = require('../../utils/response');
const constants = require('../../config/constants');

class TeamService {
  // Get all maintenance teams
  static async getAllTeams(queryOptions = {}) {
    try {
      const {
        page = 1,
        limit = constants.DEFAULTS.PAGE_SIZE,
        search,
        is_active
      } = queryOptions;

      let whereConditions = ['1=1'];
      let queryParams = [];

      // Add filters
      if (search) {
        whereConditions.push('(mt.team_name LIKE ? OR mt.description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (is_active !== undefined) {
        whereConditions.push('mt.is_active = ?');
        queryParams.push(is_active);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM maintenance_teams mt
        WHERE ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get teams with member counts
      const teamsQuery = `
        SELECT 
          mt.id,
          mt.team_name,
          mt.description,
          mt.is_active,
          mt.created_at,
          COUNT(tm.user_id) as member_count,
          -- Get team lead if exists
          GROUP_CONCAT(
            CASE WHEN tm.is_lead = true THEN u.name END
          ) as team_leads
        FROM maintenance_teams mt
        LEFT JOIN team_members tm ON mt.id = tm.team_id
        LEFT JOIN users u ON tm.user_id = u.id AND u.is_active = true
        WHERE ${whereClause}
        GROUP BY mt.id
        ORDER BY mt.team_name ASC
        LIMIT ? OFFSET ?
      `;

      const teamsResult = await executeQuery(
        teamsQuery, 
        [...queryParams, parseInt(limit), (page - 1) * limit]
      );

      // Process team leads (convert to array or null)
      const processedTeams = teamsResult.map(team => ({
        ...team,
        team_leads: team.team_leads ? team.team_leads.split(',').filter(lead => lead) : []
      }));

      logger.info('Teams retrieved successfully', { 
        total, 
        page, 
        limit,
        filters: { search, is_active }
      });

      return {
        teams: processedTeams,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get all teams error', error);
      throw error;
    }
  }

  // Get team by ID
  static async getTeamById(teamId) {
    try {
      const team = await executeQuery(`
        SELECT 
          mt.*,
          COUNT(tm.user_id) as member_count
        FROM maintenance_teams mt
        LEFT JOIN team_members tm ON mt.id = tm.team_id
        WHERE mt.id = ?
        GROUP BY mt.id
      `, [teamId]);

      if (team.length === 0) {
        throw new Error('Team not found');
      }

      // Get team members with details
      const members = await executeQuery(`
        SELECT 
          tm.id as membership_id,
          tm.team_id,
          tm.user_id,
          tm.is_lead,
          tm.assigned_at,
          u.name as user_name,
          u.email as user_email,
          r.name as role_name
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE tm.team_id = ?
        ORDER BY tm.is_lead DESC, u.name ASC
      `, [teamId]);

      const result = {
        ...team[0],
        members: members
      };

      logger.info('Team retrieved by ID', { teamId });

      return result;
    } catch (error) {
      logger.error('Get team by ID error', error);
      throw error;
    }
  }

  // Create new team
  static async createTeam(teamData) {
    try {
      const { team_name, description } = teamData;

      // Check if team name already exists
      const existing = await executeQuery(
        'SELECT id FROM maintenance_teams WHERE team_name = ?',
        [team_name]
      );

      if (existing.length > 0) {
        throw new Error('Team with this name already exists');
      }

      const result = await executeQuery(`
        INSERT INTO maintenance_teams (team_name, description) VALUES (?, ?)
      `, [team_name, description]);

      const teamId = result.insertId;

      logger.info('Team created successfully', { teamId, team_name });

      return await this.getTeamById(teamId);
    } catch (error) {
      logger.error('Create team error', error);
      throw error;
    }
  }

  // Update team
  static async updateTeam(teamId, updateData) {
    try {
      // Check if team exists
      const existing = await executeQuery(
        'SELECT id FROM maintenance_teams WHERE id = ?',
        [teamId]
      );

      if (existing.length === 0) {
        throw new Error('Team not found');
      }

      // If updating team name, check for duplicates
      if (updateData.team_name) {
        const duplicate = await executeQuery(
          'SELECT id FROM maintenance_teams WHERE team_name = ? AND id != ?',
          [updateData.team_name, teamId]
        );

        if (duplicate.length > 0) {
          throw new Error('Team with this name already exists');
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      const allowedFields = ['team_name', 'description', 'is_active'];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(teamId);

      await executeQuery(
        `UPDATE maintenance_teams SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      logger.info('Team updated successfully', { teamId });

      return await this.getTeamById(teamId);
    } catch (error) {
      logger.error('Update team error', error);
      throw error;
    }
  }

  // Add member to team
  static async addTeamMember(teamId, userId, isLead = false) {
    try {
      // Verify team exists
      const team = await executeQuery(
        'SELECT id FROM maintenance_teams WHERE id = ? AND is_active = true',
        [teamId]
      );

      if (team.length === 0) {
        throw new Error('Team not found or inactive');
      }

      // Verify user exists and is active
      const user = await executeQuery(
        'SELECT id FROM users WHERE id = ? AND is_active = true',
        [userId]
      );

      if (user.length === 0) {
        throw new Error('User not found or inactive');
      }

      // Check if user is already a member
      const existingMember = await executeQuery(
        'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
        [teamId, userId]
      );

      if (existingMember.length > 0) {
        throw new Error('User is already a member of this team');
      }

      // Add member to team
      const result = await executeQuery(`
        INSERT INTO team_members (team_id, user_id, is_lead) VALUES (?, ?, ?)
      `, [teamId, userId, isLead]);

      // Get member details for response
      const memberDetails = await executeQuery(`
        SELECT 
          tm.id as membership_id,
          tm.team_id,
          tm.user_id,
          tm.is_lead,
          tm.assigned_at,
          u.name as user_name,
          u.email as user_email,
          r.name as role_name
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE tm.id = ?
      `, [result.insertId]);

      logger.info('Team member added', { teamId, userId, isLead });

      return memberDetails[0];
    } catch (error) {
      logger.error('Add team member error', error);
      throw error;
    }
  }

  // Remove member from team
  static async removeTeamMember(membershipId) {
    try {
      // Get membership details
      const membership = await executeQuery(`
        SELECT tm.*, mt.team_name, u.name as user_name
        FROM team_members tm
        JOIN maintenance_teams mt ON tm.team_id = mt.id
        JOIN users u ON tm.user_id = u.id
        WHERE tm.id = ?
      `, [membershipId]);

      if (membership.length === 0) {
        throw new Error('Team membership not found');
      }

      // Remove membership
      await executeQuery('DELETE FROM team_members WHERE id = ?', [membershipId]);

      logger.info('Team member removed', { membershipId, teamId: membership[0].team_id });

      return { message: 'Team member removed successfully' };
    } catch (error) {
      logger.error('Remove team member error', error);
      throw error;
    }
  }

  // Make user a team lead
  static async makeTeamLead(membershipId) {
    try {
      // Update membership to make user a lead
      const result = await executeQuery(
        'UPDATE team_members SET is_lead = true WHERE id = ?',
        [membershipId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Team membership not found');
      }

      // Get updated member details
      const memberDetails = await executeQuery(`
        SELECT 
          tm.id as membership_id,
          tm.team_id,
          tm.user_id,
          tm.is_lead,
          tm.assigned_at,
          u.name as user_name,
          mt.team_name
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN maintenance_teams mt ON tm.team_id = mt.id
        WHERE tm.id = ?
      `, [membershipId]);

      logger.info('Team lead assigned', { membershipId });

      return memberDetails[0];
    } catch (error) {
      logger.error('Make team lead error', error);
      throw error;
    }
  }

  // Remove team lead status
  static async removeTeamLead(membershipId) {
    try {
      // Update membership to remove lead status
      const result = await executeQuery(
        'UPDATE team_members SET is_lead = false WHERE id = ?',
        [membershipId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Team membership not found');
      }

      logger.info('Team lead status removed', { membershipId });

      return { message: 'Team lead status removed successfully' };
    } catch (error) {
      logger.error('Remove team lead error', error);
      throw error;
    }
  }

  // Get team statistics
  static async getTeamStats() {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_teams,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_teams,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_teams
        FROM maintenance_teams
      `);

      // Get team sizes
      const teamSizes = await executeQuery(`
        SELECT 
          mt.team_name,
          COUNT(tm.user_id) as member_count
        FROM maintenance_teams mt
        LEFT JOIN team_members tm ON mt.id = tm.team_id
        WHERE mt.is_active = true
        GROUP BY mt.id, mt.team_name
        ORDER BY member_count DESC
      `);

      // Get team leads
      const teamLeads = await executeQuery(`
        SELECT 
          mt.team_name,
          u.name as lead_name,
          u.email as lead_email
        FROM team_members tm
        JOIN maintenance_teams mt ON tm.team_id = mt.id
        JOIN users u ON tm.user_id = u.id
        WHERE tm.is_lead = true AND mt.is_active = true
        ORDER BY mt.team_name
      `);

      logger.info('Team statistics retrieved successfully');

      return {
        overview: stats[0],
        team_sizes: teamSizes,
        team_leads: teamLeads
      };
    } catch (error) {
      logger.error('Get team stats error', error);
      throw error;
    }
  }

  // Get teams for dropdown/select
  static async getTeamOptions() {
    try {
      const teams = await executeQuery(`
        SELECT 
          id,
          team_name,
          description
        FROM maintenance_teams
        WHERE is_active = true
        ORDER BY team_name ASC
      `);

      return teams;
    } catch (error) {
      logger.error('Get team options error', error);
      throw error;
    }
  }

  // Get technicians for a team (for assignment)
  static async getTeamTechnicians(teamId) {
    try {
      const technicians = await executeQuery(`
        SELECT 
          u.id,
          u.name,
          u.email,
          r.name as role_name,
          tm.is_lead
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE tm.team_id = ? 
        AND u.is_active = true
        AND r.name = 'Technician'
        ORDER BY tm.is_lead DESC, u.name ASC
      `, [teamId]);

      return technicians;
    } catch (error) {
      logger.error('Get team technicians error', error);
      throw error;
    }
  }
}

module.exports = TeamService;
