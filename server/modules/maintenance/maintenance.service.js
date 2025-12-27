// Maintenance Service - Core ERP Module
const { executeQuery } = require('../../config/db.config');
const { logger } = require('../../utils/response');
const constants = require('../../config/constants');

class MaintenanceService {
  // Get all maintenance requests with Kanban support
  static async getAllMaintenanceRequests(queryOptions = {}) {
    try {
      const {
        page = 1,
        limit = constants.DEFAULTS.PAGE_SIZE,
        status,
        type,
        priority,
        equipment_id,
        team_id,
        technician_id,
        created_by,
        date_from,
        date_to,
        search
      } = queryOptions;

      let whereConditions = ['1=1'];
      let queryParams = [];

      // Add filters
      if (status) {
        whereConditions.push('mr.status = ?');
        queryParams.push(status);
      }

      if (type) {
        whereConditions.push('mr.type = ?');
        queryParams.push(type);
      }

      if (priority) {
        whereConditions.push('mr.priority = ?');
        queryParams.push(priority);
      }

      if (equipment_id) {
        whereConditions.push('mr.equipment_id = ?');
        queryParams.push(equipment_id);
      }

      if (team_id) {
        whereConditions.push('mr.team_id = ?');
        queryParams.push(team_id);
      }

      if (technician_id) {
        whereConditions.push('mr.technician_id = ?');
        queryParams.push(technician_id);
      }

      if (created_by) {
        whereConditions.push('mr.created_by = ?');
        queryParams.push(created_by);
      }

      if (date_from) {
        whereConditions.push('DATE(mr.created_at) >= ?');
        queryParams.push(date_from);
      }

      if (date_to) {
        whereConditions.push('DATE(mr.created_at) <= ?');
        queryParams.push(date_to);
      }

      if (search) {
        whereConditions.push('(mr.subject LIKE ? OR mr.description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM maintenance_requests mr
        WHERE ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get maintenance requests with all related data
      const requestsQuery = `
        SELECT 
          mr.id,
          mr.subject,
          mr.description,
          mr.type,
          mr.status,
          mr.priority,
          mr.scheduled_date,
          mr.completed_date,
          mr.duration_hours,
          mr.cost,
          mr.notes,
          mr.created_at,
          mr.updated_at,
          -- Equipment info
          e.name as equipment_name,
          e.serial_number as equipment_serial,
          e.department as equipment_department,
          e.location as equipment_location,
          -- Team info
          mt.team_name,
          -- Creator info
          creator.name as created_by_name,
          -- Technician info
          technician.name as technician_name,
          -- Check if overdue
          CASE 
            WHEN mr.type = 'Preventive' 
            AND mr.scheduled_date < CURDATE() 
            AND mr.status != 'Repaired' 
            THEN true 
            ELSE false 
          END as is_overdue
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        LEFT JOIN users creator ON mr.created_by = creator.id
        LEFT JOIN users technician ON mr.technician_id = technician.id
        WHERE ${whereClause}
        ORDER BY 
          CASE mr.priority 
            WHEN 'Critical' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
          END,
          mr.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const requestsResult = await executeQuery(
        requestsQuery, 
        [...queryParams, parseInt(limit), (page - 1) * limit]
      );

      logger.info('Maintenance requests retrieved successfully', { 
        total, 
        page, 
        limit,
        filters: { status, type, priority, equipment_id, team_id, technician_id }
      });

      return {
        requests: requestsResult,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Get all maintenance requests error', error);
      throw error;
    }
  }

  // Get Kanban board data
  static async getKanbanData(filters = {}) {
    try {
      const { team_id, technician_id } = filters;

      let whereConditions = ['1=1'];
      let queryParams = [];

      if (team_id) {
        whereConditions.push('mr.team_id = ?');
        queryParams.push(team_id);
      }

      if (technician_id) {
        whereConditions.push('mr.technician_id = ?');
        queryParams.push(technician_id);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get requests grouped by status
      const kanbanQuery = `
        SELECT 
          mr.status,
          mr.id,
          mr.subject,
          mr.priority,
          mr.created_at,
          mr.scheduled_date,
          e.name as equipment_name,
          e.serial_number as equipment_serial,
          mt.team_name,
          creator.name as created_by_name,
          technician.name as technician_name,
          CASE 
            WHEN mr.type = 'Preventive' 
            AND mr.scheduled_date < CURDATE() 
            AND mr.status != 'Repaired' 
            THEN true 
            ELSE false 
          END as is_overdue
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        LEFT JOIN users creator ON mr.created_by = creator.id
        LEFT JOIN users technician ON mr.technician_id = technician.id
        WHERE ${whereClause}
        ORDER BY 
          CASE mr.priority 
            WHEN 'Critical' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
          END,
          mr.created_at ASC
      `;

      const allRequests = await executeQuery(kanbanQuery, queryParams);

      // Group by status for Kanban columns
      const kanbanData = {
        'New': [],
        'In Progress': [],
        'Repaired': [],
        'Scrap': []
      };

      allRequests.forEach(request => {
        if (kanbanData[request.status]) {
          kanbanData[request.status].push(request);
        }
      });

      logger.info('Kanban data retrieved successfully', { 
        total: allRequests.length,
        byStatus: Object.keys(kanbanData).reduce((acc, status) => {
          acc[status] = kanbanData[status].length;
          return acc;
        }, {})
      });

      return kanbanData;
    } catch (error) {
      logger.error('Get Kanban data error', error);
      throw error;
    }
  }

  // Get calendar data for preventive maintenance
  static async getCalendarData(dateFrom, dateTo) {
    try {
      const calendarQuery = `
        SELECT 
          mr.id,
          mr.subject,
          mr.description,
          mr.type,
          mr.status,
          mr.scheduled_date,
          mr.priority,
          e.name as equipment_name,
          e.serial_number as equipment_serial,
          e.department as equipment_department,
          mt.team_name,
          technician.name as technician_name,
          creator.name as created_by_name,
          CASE 
            WHEN mr.scheduled_date < CURDATE() 
            AND mr.status != 'Repaired' 
            THEN true 
            ELSE false 
          END as is_overdue
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        LEFT JOIN users technician ON mr.technician_id = technician.id
        LEFT JOIN users creator ON mr.created_by = creator.id
        WHERE mr.type = 'Preventive'
        AND mr.scheduled_date BETWEEN ? AND ?
        AND mr.status != 'Scrap'
        ORDER BY mr.scheduled_date ASC
      `;

      const events = await executeQuery(calendarQuery, [dateFrom, dateTo]);

      logger.info('Calendar data retrieved successfully', { 
        eventCount: events.length,
        dateRange: { from: dateFrom, to: dateTo }
      });

      return events;
    } catch (error) {
      logger.error('Get calendar data error', error);
      throw error;
    }
  }

  // Create maintenance request
  static async createMaintenanceRequest(requestData, userId) {
    try {
      const {
        subject,
        description,
        equipment_id,
        type = constants.TYPES.CORRECTIVE,
        priority = constants.PRIORITY.MEDIUM,
        scheduled_date
      } = requestData;

      // Validate equipment exists
      const equipment = await executeQuery(
        'SELECT id, maintenance_team_id FROM equipment WHERE id = ? AND is_scrapped = false',
        [equipment_id]
      );

      if (equipment.length === 0) {
        throw new Error('Equipment not found or scrapped');
      }

      const equipmentData = equipment[0];

      // Auto-assign team based on equipment
      const team_id = equipmentData.maintenance_team_id;

      const result = await executeQuery(`
        INSERT INTO maintenance_requests (
          subject, description, equipment_id, team_id, type, priority, 
          scheduled_date, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        subject, description, equipment_id, team_id, type, priority, 
        scheduled_date, userId
      ]);

      const requestId = result.insertId;

      // Create initial log entry
      await executeQuery(
        'INSERT INTO maintenance_logs (request_id, action, performed_by) VALUES (?, ?, ?)',
        [requestId, 'Request Created', userId]
      );

      logger.info('Maintenance request created', { requestId, equipment_id, team_id, type });

      return await this.getMaintenanceRequestById(requestId);
    } catch (error) {
      logger.error('Create maintenance request error', error);
      throw error;
    }
  }

  // Update maintenance request status (for Kanban)
  static async updateRequestStatus(requestId, newStatus, userId, notes = null) {
    try {
      // Get current request
      const currentRequest = await executeQuery(
        'SELECT status, technician_id FROM maintenance_requests WHERE id = ?',
        [requestId]
      );

      if (currentRequest.length === 0) {
        throw new Error('Maintenance request not found');
      }

      const currentStatus = currentRequest[0].status;

      // Validate status transition
      const validTransitions = {
        'New': ['In Progress', 'Scrap'],
        'In Progress': ['Repaired', 'Scrap'],
        'Repaired': [],
        'Scrap': []
      };

      if (!validTransitions[currentStatus].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      // If moving to "Repaired", set completion date
      let completedDate = null;
      let durationHours = null;

      if (newStatus === 'Repaired') {
        completedDate = new Date().toISOString().split('T')[0];
        // Calculate duration (simplified - in real app, track start time)
        durationHours = 2.0; // Default duration
      }

      // Update the request
      const updateFields = ['status = ?'];
      const updateValues = [newStatus];

      if (completedDate) {
        updateFields.push('completed_date = ?');
        updateValues.push(completedDate);
      }

      if (durationHours !== null) {
        updateFields.push('duration_hours = ?');
        updateValues.push(durationHours);
      }

      if (notes) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }

      updateValues.push(requestId);

      await executeQuery(
        `UPDATE maintenance_requests SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Log the status change
      await executeQuery(
        'INSERT INTO maintenance_logs (request_id, action, old_value, new_value, performed_by) VALUES (?, ?, ?, ?, ?)',
        [requestId, 'Status Updated', currentStatus, newStatus, userId]
      );

      // If marked as scrap, update equipment status
      if (newStatus === 'Scrap') {
        const equipmentId = await executeQuery(
          'SELECT equipment_id FROM maintenance_requests WHERE id = ?',
          [requestId]
        );

        if (equipmentId.length > 0) {
          await executeQuery(
            'UPDATE equipment SET is_scrapped = true WHERE id = ?',
            [equipmentId[0].equipment_id]
          );

          await executeQuery(
            'INSERT INTO maintenance_logs (request_id, action, performed_by) VALUES (?, ?, ?)',
            [requestId, 'Equipment marked as scrapped', userId]
          );
        }
      }

      logger.info('Maintenance request status updated', { requestId, from: currentStatus, to: newStatus });

      return await this.getMaintenanceRequestById(requestId);
    } catch (error) {
      logger.error('Update request status error', error);
      throw error;
    }
  }

  // Get maintenance request by ID
  static async getMaintenanceRequestById(requestId) {
    try {
      const request = await executeQuery(`
        SELECT 
          mr.*,
          e.name as equipment_name,
          e.serial_number as equipment_serial,
          e.department as equipment_department,
          e.location as equipment_location,
          mt.team_name,
          creator.name as created_by_name,
          technician.name as technician_name,
          technician.id as technician_id
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        LEFT JOIN users creator ON mr.created_by = creator.id
        LEFT JOIN users technician ON mr.technician_id = technician.id
        WHERE mr.id = ?
      `, [requestId]);

      if (request.length === 0) {
        throw new Error('Maintenance request not found');
      }

      // Get maintenance logs for this request
      const logs = await executeQuery(`
        SELECT 
          ml.*,
          u.name as performed_by_name
        FROM maintenance_logs ml
        LEFT JOIN users u ON ml.performed_by = u.id
        WHERE ml.request_id = ?
        ORDER BY ml.timestamp DESC
      `, [requestId]);

      const result = {
        ...request[0],
        logs: logs
      };

      logger.info('Maintenance request retrieved by ID', { requestId });

      return result;
    } catch (error) {
      logger.error('Get maintenance request by ID error', error);
      throw error;
    }
  }

  // Assign technician to request
  static async assignTechnician(requestId, technicianId, assignedBy) {
    try {
      // Verify technician exists and belongs to the team
      const technician = await executeQuery(`
        SELECT u.id, u.name, tm.team_id
        FROM users u
        JOIN team_members tm ON u.id = tm.user_id
        WHERE u.id = ? AND u.is_active = true
      `, [technicianId]);

      if (technician.length === 0) {
        throw new Error('Technician not found or inactive');
      }

      const technicianData = technician[0];

      // Get request team
      const request = await executeQuery(
        'SELECT team_id FROM maintenance_requests WHERE id = ?',
        [requestId]
      );

      if (request.length === 0) {
        throw new Error('Maintenance request not found');
      }

      // Check if technician belongs to the request's team
      if (technicianData.team_id !== request[0].team_id) {
        throw new Error('Technician does not belong to the assigned team');
      }

      // Update technician assignment
      await executeQuery(
        'UPDATE maintenance_requests SET technician_id = ? WHERE id = ?',
        [technicianId, requestId]
      );

      // Log the assignment
      await executeQuery(
        'INSERT INTO maintenance_logs (request_id, action, new_value, performed_by) VALUES (?, ?, ?, ?)',
        [requestId, 'Technician Assigned', technicianData.name, assignedBy]
      );

      logger.info('Technician assigned to request', { requestId, technicianId, assignedBy });

      return await this.getMaintenanceRequestById(requestId);
    } catch (error) {
      logger.error('Assign technician error', error);
      throw error;
    }
  }
}

module.exports = MaintenanceService;
