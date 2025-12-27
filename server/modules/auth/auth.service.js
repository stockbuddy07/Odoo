// Authentication Service
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../../config/db.config');
const { logger } = require('../../utils/response');
const constants = require('../../config/constants');

class AuthService {
  // Register new user
  static async register(userData) {
    try {
      const { name, email, password, role_id = constants.ROLES.USER } = userData;

      // Check if user already exists
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        throw new Error(constants.MESSAGES.DUPLICATE_EMAIL);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

      // Create user
      const result = await executeQuery(
        'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role_id]
      );

      const userId = result.insertId;

      // Get created user (without password)
      const newUser = await executeQuery(
        'SELECT u.id, u.name, u.email, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [userId]
      );

      logger.info('User registered successfully', { userId, email });

      return {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role_name
      };
    } catch (error) {
      logger.error('Registration error', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user by email
      const users = await executeQuery(
        'SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? AND u.is_active = true',
        [email]
      );

      if (users.length === 0) {
        throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error(constants.MESSAGES.INVALID_CREDENTIALS);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          role_id: user.role_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info('User logged in successfully', { userId: user.id, email });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          role_id: user.role_id
        },
        token
      };
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  // Get user profile
  static async getProfile(userId) {
    try {
      const user = await executeQuery(
        'SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.created_at FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [userId]
      );

      if (user.length === 0) {
        throw new Error('User not found');
      }

      return user[0];
    } catch (error) {
      logger.error('Get profile error', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    try {
      const { name, email } = updateData;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await executeQuery(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );

        if (existingUser.length > 0) {
          throw new Error(constants.MESSAGES.DUPLICATE_EMAIL);
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }

      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateValues.push(userId);

      await executeQuery(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Get updated user
      const updatedUser = await executeQuery(
        'SELECT u.id, u.name, u.email, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
        [userId]
      );

      logger.info('User profile updated', { userId });

      return updatedUser[0];
    } catch (error) {
      logger.error('Update profile error', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current password hash
      const users = await executeQuery(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));

      // Update password
      await executeQuery(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );

      logger.info('Password changed successfully', { userId });

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error', error);
      throw error;
    }
  }
}

module.exports = AuthService;
