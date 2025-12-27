// API Configuration and Service Layer
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gearguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('gearguard_token');
      localStorage.removeItem('gearguard_user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// API Service Classes
export class AuthService {
  static async login(email, password_hash) {
    return await api.post('/auth/login', { email, password_hash });
  }

  static async register(userData) {
    return await api.post('/auth/register', userData);
  }

  static async getProfile() {
    return await api.get('/auth/profile');
  }

  static async updateProfile(data) {
    return await api.put('/auth/profile', data);
  }

  static async changePassword(data) {
    return await api.put('/auth/change-password', data);
  }

  static async logout() {
    return await api.post('/auth/logout');
  }

  static async verifyToken() {
    return await api.get('/auth/verify-token');
  }
}

export class EquipmentService {
  static async getAll(params = {}) {
    return await api.get('/equipment', { params });
  }

  static async getById(id) {
    return await api.get(`/equipment/${id}`);
  }

  static async create(data) {
    return await api.post('/equipment', data);
  }

  static async update(id, data) {
    return await api.put(`/equipment/${id}`, data);
  }

  static async delete(id) {
    return await api.delete(`/equipment/${id}`);
  }

  static async getStats() {
    return await api.get('/equipment/stats');
  }

  static async getOptions() {
    return await api.get('/equipment/options');
  }
}

export class MaintenanceService {
  static async getAll(params = {}) {
    return await api.get('/maintenance', { params });
  }

  static async getById(id) {
    return await api.get(`/maintenance/${id}`);
  }

  static async create(data) {
    return await api.post('/maintenance', data);
  }

  static async updateStatus(id, status, notes = null) {
    return await api.put(`/maintenance/${id}/status`, { status, notes });
  }

  static async assignTechnician(id, technicianId) {
    return await api.post(`/maintenance/${id}/assign`, { technician_id: technicianId });
  }

  static async getKanbanData(filters = {}) {
    return await api.get('/maintenance/kanban', { params: filters });
  }

  static async getCalendarData(dateFrom, dateTo) {
    return await api.get('/maintenance/calendar', {
      params: { dateFrom, dateTo }
    });
  }

  static async getStats() {
    return await api.get('/maintenance/stats');
  }

  static async delete(id) {
    return await api.delete(`/maintenance/${id}`);
  }
}

export class TeamService {
  static async getAll(params = {}) {
    return await api.get('/teams', { params });
  }

  static async getById(id) {
    return await api.get(`/teams/${id}`);
  }

  static async create(data) {
    return await api.post('/teams', data);
  }

  static async update(id, data) {
    return await api.put(`/teams/${id}`, data);
  }

  static async delete(id) {
    return await api.delete(`/teams/${id}`);
  }

  static async addMember(teamId, userId, isLead = false) {
    return await api.post(`/teams/${teamId}/members`, {
      user_id: userId,
      is_lead: isLead
    });
  }

  static async removeMember(membershipId) {
    return await api.delete(`/teams/members/${membershipId}`);
  }

  static async makeLead(membershipId) {
    return await api.put(`/teams/members/${membershipId}/lead`);
  }

  static async removeLead(membershipId) {
    return await api.put(`/teams/members/${membershipId}/remove-lead`);
  }

  static async getStats() {
    return await api.get('/teams/stats');
  }

  static async getOptions() {
    return await api.get('/teams/options');
  }

  static async getTechnicians(teamId) {
    return await api.get(`/teams/${teamId}/technicians`);
  }
}

export default api;
