// Authentication Context for managing user state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api';
import toast from 'react-hot-toast';

// ✅ CREATE CONTEXT HERE (NO SELF IMPORT)
export const AuthContext = createContext(null);

// ✅ CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ PROVIDER
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ✅ Check auth token and user
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('gearguard_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await AuthService.verifyToken();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('gearguard_user', JSON.stringify(response.data.user));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN using password_hash
  const login = async (email, password_hash) => {
    try {
      setLoading(true);
      const response = await AuthService.login({ email, password_hash });

      if (!response?.success) {
        toast.error(response?.message || 'Login failed');
        return { success: false };
      }

      const { user, token } = response.data;
      localStorage.setItem('gearguard_token', token);
      localStorage.setItem('gearguard_user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid email or password';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER using password_hash
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await AuthService.register(userData);

      if (!response?.success) {
        toast.error(response?.message || 'Registration failed');
        return { success: false };
      }

      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('gearguard_token');
      localStorage.removeItem('gearguard_user');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      toast.success('Logged out successfully');
    }
  };

  // ✅ UPDATE PROFILE
  const updateProfile = async (profileData) => {
    try {
      const response = await AuthService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('gearguard_user', JSON.stringify(response.data));
        toast.success('Profile updated successfully');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error('Profile update failed');
      return { success: false };
    }
  };

  // ✅ CHANGE PASSWORD
  const changePassword = async (passwordData) => {
    try {
      const response = await AuthService.changePassword(passwordData);
      if (response.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error('Password change failed');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
