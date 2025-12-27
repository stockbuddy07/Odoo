// Login Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`form-input ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`form-input ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="spinner h-4 w-4 mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Admin:</strong> admin@gearguard.com / password123</p>
          <p><strong>Manager:</strong> john.smith@gearguard.com / password123</p>
          <p><strong>Technician:</strong> mike.johnson@gearguard.com / password123</p>
          <p><strong>User:</strong> lisa.davis@gearguard.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
