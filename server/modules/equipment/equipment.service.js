// Equipment Service
const { executeQuery } = require('../../config/db.config');
const { logger } = require('../../utils/response');
const constants = require('../../config/constants');

class EquipmentService {
  // Get all equipment with pagination and filters
  static async getAllEquipment(queryOptions = {}) {
    try {
      const {
        page = 1,
        limit = constants.DEFAULTS.PAGE_SIZE,
        department,
        maintenance_team_id,
        is_scrapped,
        search
      } = queryOptions;

      let whereConditions = ['1=1'];
      let queryParams = [];

      // Add filters
      if (department) {
        whereConditions.push('e.department LIKE ?');
        queryParams.push(`%${department}%`);
      }

      if (maintenance_team_id) {
        whereConditions.push('e.maintenance_team_id = ?');
        queryParams.push(maintenance_team_id);
      }

      if (is_scrapped !== undefined) {
        whereConditions.push('e.is_scrapped = ?');
        queryParams.push(is_scrapped);
      }

      if (search) {
        whereConditions.push('(e.name LIKE ? OR e.serial_number LIKE ? OR e.location LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM equipment e
        WHERE ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get equipment with team information
      const equipmentQuery = `
        SELECT 
          e.id,
          e.name,
          e.serial_number,
          e.department,
          e.assigned_employee,
          e.purchase_date,
          e.warranty_end,
          e.location,
          e.is_scrapped,
          e.created_at,
          mt.team_name,
          mt.id as team_id,
          -- Calculate open requests count
          COALESCE(open_requests.request_count, 0) as open_requests_count
        FROM equipment e
        LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
        LEFT JOIN (
          SELECT 
            equipment_id,
            COUNT(*) as request_count
          FROM maintenance_requests 
          WHERE status != 'Repaired' AND status != 'Scrap'
          GROUP BY equipment_id
        ) open_requests ON e.id = open_requests.equipment_id
        WHERE ${whereClause}
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const equipmentResult = await executeQuery(
        equipmentQuery, 
        [...queryParams, parseInt(limit), (page - 1) * limit]
      );

      logger.info('Equipment retrieved successfully', { 
        total, 
        page, 
        limit,
        filters: { department, maintenance_team_id, is_scrapped, search }
      });

      return {
        equipment: equipmentResult,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get all equipment error', error);
      throw error;
    }
  }

  // Get equipment by ID
  static async getEquipmentById(equipmentId) {
    try {
      const equipment = await executeQuery(`
        SELECT 
          e.*,
          mt.team_name,
          mt.id as team_id
        FROM equipment e
        LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
        WHERE e.id = ?
      `, [equipmentId]);

      if (equipment.length === 0) {
        throw new Error('Equipment not found');
      }

      // Get maintenance history for this equipment
      const maintenanceHistory = await executeQuery(`
        SELECT 
          mr.id,
          mr.subject,
          mr.type,
          mr.status,
          mr.priority,
          mr.scheduled_date,
          mr.completed_date,
          mr.duration_hours,
          mr.cost,
          mr.created_at,
          u.name as created_by_name,
          tech.name as technician_name
        FROM maintenance_requests mr
        LEFT JOIN users u ON mr.created_by = u.id
        LEFT JOIN users tech ON mr.technician_id = tech.id
        WHERE mr.equipment_id = ?
        ORDER BY mr.created_at DESC
        LIMIT 10
      `, [equipmentId]);

      const result = {
        ...equipment[0],
        maintenance_history: maintenanceHistory
      };

      logger.info('Equipment retrieved by ID', { equipmentId });

      return result;
    } catch (error) {
      logger.error('Get equipment by ID error', error);
      throw error;
    }
  }

  // Create new equipment
  static async createEquipment(equipmentData) {
    try {
      const {
        name,
        serial_number,
        department,
        assigned_employee,
        purchase_date,
        warranty_end,
        location,
        maintenance_team_id
      } = equipmentData;

      // Check if serial number already exists
      const existing = await executeQuery(
        'SELECT id FROM equipment WHERE serial_number = ?',
        [serial_number]
      );

      if (existing.length > 0) {
        throw new Error('Equipment with this serial number already exists');
      }

      // Verify maintenance team exists
      const team = await executeQuery(
        'SELECT id FROM maintenance_teams WHERE id = ?',
        [maintenance_team_id]
      );

      if (team.length === 0) {
        throw new Error('Maintenance team not found');
      }

      const result = await executeQuery(`
        INSERT INTO equipment (
          name, serial_number, department, assigned_employee,
          purchase_date, warranty_end, location, maintenance_team_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, serial_number, department, assigned_employee,
        purchase_date, warranty_end, location, maintenance_team_id
      ]);

      const equipmentId = result.insertId;

      logger.info('Equipment created successfully', { equipmentId, serial_number });

      return await this.getEquipmentById(equipmentId);
    } catch (error) {
      logger.error('Create equipment error', error);
      throw error;
    }
  }

  // Update equipment
  static async updateEquipment(equipmentId, updateData) {
    try {
      // Check if equipment exists
      const existing = await executeQuery(
        'SELECT id FROM equipment WHERE id = ?',
        [equipmentId]
      );

      if (existing.length === 0) {
        throw new Error('Equipment not found');
      }

      // If updating serial number, check for duplicates
      if (updateData.serial_number) {
        const duplicate = await executeQuery(
          'SELECT id FROM equipment WHERE serial_number = ? AND id != ?',
          [updateData.serial_number, equipmentId]
        );

        if (duplicate.length > 0) {
          throw new Error('Equipment with this serial number already exists');
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      const allowedFields = [
        'name', 'serial_number', 'department', 'assigned_employee',
        'purchase_date', 'warranty_end', 'location', 'maintenance_team_id', 'is_scrapped'
      ];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(equipmentId);

      await executeQuery(
        `UPDATE equipment SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      logger.info('Equipment updated successfully', { equipmentId });

      return await this.getEquipmentById(equipmentId);
    } catch (error) {
      logger.error('Update equipment error', error);
      throw error;
    }
  }

  // Delete equipment
  static async deleteEquipment(equipmentId) {
    try {
      // Check if equipment exists
      const existing = await executeQuery(
        'SELECT id FROM equipment WHERE id = ?',
        [equipmentId]
      );

      if (existing.length === 0) {
        throw new Error('Equipment not found');
      }

      // Check if there are active maintenance requests
      const activeRequests = await executeQuery(
        'SELECT COUNT(*) as count FROM maintenance_requests WHERE equipment_id = ? AND status NOT IN ("Repaired", "Scrap")',
        [equipmentId]
      );

      if (activeRequests[0].count > 0) {
        throw new Error('Cannot delete equipment with active maintenance requests');
      }

      await executeQuery('DELETE FROM equipment WHERE id = ?', [equipmentId]);

      logger.info('Equipment deleted successfully', { equipmentId });

      return { message: 'Equipment deleted successfully' };
    } catch (error) {
      logger.error('Delete equipment error', error);
      throw error;
    }
  }

  // Get equipment statistics
  static async getEquipmentStats() {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_equipment,
          COUNT(CASE WHEN is_scrapped = true THEN 1 END) as scrapped_equipment,
          COUNT(CASE WHEN is_scrapped = false THEN 1 END) as active_equipment,
          COUNT(CASE WHEN warranty_end < CURDATE() THEN 1 END) as expired_warranty
        FROM equipment
      `);

      // Get equipment by department
      const byDepartment = await executeQuery(`
        SELECT 
          department,
          COUNT(*) as count,
          COUNT(CASE WHEN is_scrapped = false THEN 1 END) as active_count
        FROM equipment
        GROUP BY department
        ORDER BY count DESC
      `);

      // Get equipment by team
      const byTeam = await executeQuery(`
        SELECT 
          mt.team_name,
          COUNT(e.id) as equipment_count,
          COUNT(CASE WHEN e.is_scrapped = false THEN 1 END) as active_count
        FROM maintenance_teams mt
        LEFT JOIN equipment e ON mt.id = e.maintenance_team_id
        GROUP BY mt.id, mt.team_name
        ORDER BY equipment_count DESC
      `);

      logger.info('Equipment statistics retrieved successfully');

      return {
        overview: stats[0],
        by_department: byDepartment,
        by_team: byTeam
      };
    } catch (error) {
      logger.error('Get equipment stats error', error);
      throw error;
    }
  }
}

module.exports = EquipmentService;
