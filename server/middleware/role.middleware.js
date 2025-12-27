// Role-based Access Control Middleware
const constants = require('../config/constants');

// Check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(constants.RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: constants.MESSAGES.UNAUTHORIZED
        });
      }

      const userRoleId = req.user.role_id;
      
      if (!allowedRoles.includes(userRoleId)) {
        return res.status(constants.RESPONSE_CODES.FORBIDDEN).json({
          success: false,
          message: constants.MESSAGES.FORBIDDEN
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(constants.RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: 'Role validation failed'
      });
    }
  };
};

// Admin only
const requireAdmin = requireRole(constants.ROLES.ADMIN);

// Manager or Admin
const requireManager = requireRole(constants.ROLES.ADMIN, constants.ROLES.MANAGER);

// Technician or above
const requireTechnician = requireRole(
  constants.ROLES.ADMIN, 
  constants.ROLES.MANAGER, 
  constants.ROLES.TECHNICIAN
);

// Check if user can access specific resource
const canAccessResource = (resourceType) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(constants.RESPONSE_CODES.UNAUTHORIZED).json({
          success: false,
          message: constants.MESSAGES.UNAUTHORIZED
        });
      }

      const userRoleId = req.user.role_id;
      const userId = req.user.id;

      // Admin can access everything
      if (userRoleId === constants.ROLES.ADMIN) {
        return next();
      }

      // Managers can access most resources
      if (userRoleId === constants.ROLES.MANAGER) {
        return next();
      }

      // Technicians have limited access based on assignments
      if (userRoleId === constants.ROLES.TECHNICIAN) {
        // For maintenance requests, check if assigned to user
        if (resourceType === 'maintenance') {
          const requestId = req.params.id;
          if (requestId) {
            // This will be validated in the controller
            req.checkResourceAccess = true;
          }
        }
        return next();
      }

      // Regular users have very limited access
      if (userRoleId === constants.ROLES.USER) {
        // Users can only access resources they created
        if (resourceType === 'maintenance') {
          req.checkResourceOwnership = true;
        }
        return next();
      }

      return res.status(constants.RESPONSE_CODES.FORBIDDEN).json({
        success: false,
        message: constants.MESSAGES.FORBIDDEN
      });

    } catch (error) {
      console.error('Resource access error:', error);
      return res.status(constants.RESPONSE_CODES.SERVER_ERROR).json({
        success: false,
        message: 'Resource access validation failed'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireManager,
  requireTechnician,
  canAccessResource
};
