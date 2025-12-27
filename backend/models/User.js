const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create new user
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password, first_name, last_name) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      email, 
      hashedPassword, 
      firstName, 
      lastName
    ]);
    
    return new User({ id: result.insertId, ...userData, password: hashedPassword });
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const users = await executeQuery(query, [email]);
    
    if (users.length === 0) {
      return null;
    }
    
    return new User(users[0]);
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const users = await executeQuery(query, [id]);
    
    if (users.length === 0) {
      return null;
    }
    
    return new User(users[0]);
  }

  // Get all users (for admin purposes)
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, email, first_name, last_name, is_active, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const users = await executeQuery(query, [limit, offset]);
    return users.map(user => new User(user));
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['email', 'firstName', 'lastName'];
    const fields = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field === 'firstName' ? 'first_name' : field === 'lastName' ? 'last_name' : field} = ?`);
        values.push(updateData[field]);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(this.id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    // Update local object
    Object.assign(this, updateData);
    return this;
  }

  // Delete user (soft delete)
  async delete() {
    const query = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    await executeQuery(query, [this.id]);
    this.isActive = false;
    return this;
  }

  // Check password
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get user profile
  async getProfile() {
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.created_at,
        up.phone, up.address, up.bio, up.avatar_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.is_active = TRUE
    `;
    
    const results = await executeQuery(query, [this.id]);
    
    if (results.length === 0) {
      return null;
    }
    
    return {
      id: results[0].id,
      email: results[0].email,
      firstName: results[0].first_name,
      lastName: results[0].last_name,
      phone: results[0].phone,
      address: results[0].address,
      bio: results[0].bio,
      avatarUrl: results[0].avatar_url,
      createdAt: results[0].created_at
    };
  }

  // Update user profile
  async updateProfile(profileData) {
    const { phone, address, bio, avatarUrl } = profileData;
    
    const query = `
      INSERT INTO user_profiles (user_id, phone, address, bio, avatar_url)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        phone = VALUES(phone),
        address = VALUES(address),
        bio = VALUES(bio),
        avatar_url = VALUES(avatar_url)
    `;
    
    await executeQuery(query, [
      this.id,
      phone || null,
      address || null,
      bio || null,
      avatarUrl || null
    ]);
    
    return this.getProfile();
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}

module.exports = User;
