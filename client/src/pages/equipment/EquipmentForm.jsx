// Equipment Form Page - Create/Edit Equipment
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EquipmentService, TeamService } from '../../services/api';
import toast from 'react-hot-toast';

// Icons
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EquipmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    department: '',
    assigned_employee: '',
    purchase_date: '',
    warranty_end: '',
    location: '',
    maintenance_team_id: ''
  });

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTeams();
    if (isEdit) {
      loadEquipment();
    }
  }, [id]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getOptions();
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await EquipmentService.getById(id);
      if (response.success) {
        const equipment = response.data;
        setFormData({
          name: equipment.name || '',
          serial_number: equipment.serial_number || '',
          department: equipment.department || '',
          assigned_employee: equipment.assigned_employee || '',
          purchase_date: equipment.purchase_date || '',
          warranty_end: equipment.warranty_end || '',
          location: equipment.location || '',
          maintenance_team_id: equipment.maintenance_team_id || ''
        });
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = 'Serial number is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.purchase_date && new Date(formData.purchase_date) > new Date()) {
      newErrors.purchase_date = 'Purchase date cannot be in the future';
    }

    if (formData.warranty_end && formData.purchase_date) {
      if (new Date(formData.warranty_end) <= new Date(formData.purchase_date)) {
        newErrors.warranty_end = 'Warranty end date must be after purchase date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      let response;
      if (isEdit) {
        response = await EquipmentService.update(id, formData);
      } else {
        response = await EquipmentService.create(formData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Equipment updated successfully' : 'Equipment created successfully');
        navigate('/equipment');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      const message = error.message || 'Failed to save equipment';
      toast.error(message);
      
      // Handle duplicate serial number error
      if (message.includes('serial_number')) {
        setErrors({ serial_number: 'Serial number already exists' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/equipment');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update equipment information' : 'Register new equipment in the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Equipment Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., CNC Machine Model X200"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Serial Number */}
            <div>
              <label htmlFor="serial_number" className="form-label">
                Serial Number *
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                className={`form-input ${errors.serial_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., CNC-001-2023"
                value={formData.serial_number}
                onChange={handleChange}
              />
              {errors.serial_number && (
                <p className="mt-1 text-sm text-red-600">{errors.serial_number}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="form-label">
                Department *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className={`form-input ${errors.department ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., Production, Administration, IT"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            {/* Assigned Employee */}
            <div>
              <label htmlFor="assigned_employee" className="form-label">
                Assigned Employee
              </label>
              <input
                type="text"
                id="assigned_employee"
                name="assigned_employee"
                className="form-input"
                placeholder="e.g., John Doe"
                value={formData.assigned_employee}
                onChange={handleChange}
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label htmlFor="purchase_date" className="form-label">
                Purchase Date
              </label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                className={`form-input ${errors.purchase_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                value={formData.purchase_date}
                onChange={handleChange}
              />
              {errors.purchase_date && (
                <p className="mt-1 text-sm text-red-600">{errors.purchase_date}</p>
              )}
            </div>

            {/* Warranty End */}
            <div>
              <label htmlFor="warranty_end" className="form-label">
                Warranty End Date
              </label>
              <input
                type="date"
                id="warranty_end"
                name="warranty_end"
                className={`form-input ${errors.warranty_end ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                value={formData.warranty_end}
                onChange={handleChange}
              />
              {errors.warranty_end && (
                <p className="mt-1 text-sm text-red-600">{errors.warranty_end}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className={`form-input ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., Plant 1 - Line A, Office Floor 2"
                value={formData.location}
                onChange={handleChange}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Maintenance Team */}
            <div>
              <label htmlFor="maintenance_team_id" className="form-label">
                Maintenance Team
              </label>
              <select
                id="maintenance_team_id"
                name="maintenance_team_id"
                className="form-select"
                value={formData.maintenance_team_id}
                onChange={handleChange}
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="spinner h-4 w-4 mr-2"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEdit ? 'Update Equipment' : 'Create Equipment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
