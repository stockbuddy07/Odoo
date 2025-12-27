// Application Constants
const constants = {
  // User Roles
  ROLES: {
    ADMIN: 1,
    MANAGER: 2,
    TECHNICIAN: 3,
    USER: 4
  },
  
  ROLE_NAMES: {
    1: 'Admin',
    2: 'Manager', 
    3: 'Technician',
    4: 'User'
  },

  // Maintenance Request Status
  STATUS: {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    REPAIRED: 'Repaired',
    SCRAP: 'Scrap'
  },

  // Maintenance Types
  TYPES: {
    CORRECTIVE: 'Corrective',
    PREVENTIVE: 'Preventive'
  },

  // Priority Levels
  PRIORITY: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical'
  },

  // API Response Codes
  RESPONSE_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  },

  // Validation Messages
  MESSAGES: {
    VALIDATION_ERROR: 'Validation failed',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    DUPLICATE_EMAIL: 'Email already exists',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_REQUIRED: 'Access token required',
    TOKEN_INVALID: 'Invalid or expired token'
  },

  // Default Values
  DEFAULTS: {
    PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  }
};

module.exports = constants;
