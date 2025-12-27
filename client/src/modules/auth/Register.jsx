// Register Component
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      // Registration successful, user will be redirected via context
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

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
            autoComplete="new-password"
            required
            className={`form-input ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must contain uppercase, lowercase, and number (min 6 characters)
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={`form-input ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
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
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
