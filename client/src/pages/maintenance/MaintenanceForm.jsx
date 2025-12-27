// Maintenance Form Page - Create/Edit Maintenance Requests
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceService, EquipmentService, TeamService } from '../../services/api';
import toast from 'react-hot-toast';

// Icons
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipment_id: '',
    type: 'Corrective',
    priority: 'Medium',
    scheduled_date: '',
    notes: ''
  });

  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadEquipment();
    if (isEdit) {
      loadRequest();
    }
  }, [id]);

  useEffect(() => {
    // Auto-assign team when equipment is selected
    if (selectedEquipment && !isEdit) {
      setFormData(prev => ({
        ...prev,
        // The team assignment will be handled by the backend based on equipment
      }));
    }
  }, [selectedEquipment, isEdit]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await EquipmentService.getAll({ status: 'active' });
      if (response.success) {
        setEquipment(response.data.equipment || []);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await MaintenanceService.getById(id);
      if (response.success) {
        const request = response.data;
        setFormData({
          subject: request.subject || '',
          description: request.description || '',
          equipment_id: request.equipment_id || '',
          type: request.type || 'Corrective',
          priority: request.priority || 'Medium',
          scheduled_date: request.scheduled_date || '',
          notes: request.notes || ''
        });

        // Find the equipment to set selectedEquipment
        const foundEquipment = equipment.find(eq => eq.id === request.equipment_id);
        setSelectedEquipment(foundEquipment);
      }
    } catch (error) {
      console.error('Error loading request:', error);
      toast.error('Failed to load request');
      navigate('/maintenance');
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

    // Handle equipment selection
    if (name === 'equipment_id') {
      const selectedEq = equipment.find(eq => eq.id === parseInt(value));
      setSelectedEquipment(selectedEq);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.equipment_id) {
      newErrors.equipment_id = 'Equipment selection is required';
    }

    if (formData.type === 'Preventive' && !formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required for preventive maintenance';
    }

    if (formData.scheduled_date && new Date(formData.scheduled_date) < new Date()) {
      newErrors.scheduled_date = 'Scheduled date cannot be in the past';
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
        response = await MaintenanceService.update(id, formData);
      } else {
        response = await MaintenanceService.create(formData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Request updated successfully' : 'Request created successfully');
        navigate('/maintenance');
      }
    } catch (error) {
      console.error('Error saving request:', error);
      const message = error.message || 'Failed to save request';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/maintenance');
  };

  const handleEquipmentChange = (equipmentId) => {
    const selectedEq = equipment.find(eq => eq.id === parseInt(equipmentId));
    setSelectedEquipment(selectedEq);
    setFormData(prev => ({
      ...prev,
      equipment_id: equipmentId
    }));
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
            {isEdit ? 'Edit Maintenance Request' : 'New Maintenance Request'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update maintenance request details' : 'Create a new maintenance or repair request'}
          </p>
        </div>
      </div>

      {/* Equipment Information Display */}
      {selectedEquipment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Equipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Name:</span>
              <span className="ml-2 text-blue-600">{selectedEquipment.name}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Serial:</span>
              <span className="ml-2 text-blue-600">{selectedEquipment.serial_number}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Department:</span>
              <span className="ml-2 text-blue-600">{selectedEquipment.department}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Location:</span>
              <span className="ml-2 text-blue-600">{selectedEquipment.location}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Team:</span>
              <span className="ml-2 text-blue-600">{selectedEquipment.maintenance_team_name || 'Not Assigned'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                selectedEquipment.is_scrapped ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {selectedEquipment.is_scrapped ? 'Scrapped' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div className="md:col-span-2">
              <label htmlFor="subject" className="form-label">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`form-input ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Brief description of the issue or maintenance"
                value={formData.subject}
                onChange={handleChange}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Equipment Selection */}
            <div>
              <label htmlFor="equipment_id" className="form-label">
                Equipment *
              </label>
              <select
                id="equipment_id"
                name="equipment_id"
                className={`form-select ${errors.equipment_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                value={formData.equipment_id}
                onChange={(e) => handleEquipmentChange(e.target.value)}
              >
                <option value="">Select equipment</option>
                {equipment.map(eq => (
                  <option 
                    key={eq.id} 
                    value={eq.id}
                    disabled={eq.is_scrapped}
                  >
                    {eq.name} ({eq.serial_number}) {eq.is_scrapped ? '[SCRAPPED]' : ''}
                  </option>
                ))}
              </select>
              {errors.equipment_id && (
                <p className="mt-1 text-sm text-red-600">{errors.equipment_id}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="form-label">
                Maintenance Type
              </label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Corrective">Corrective (Breakdown)</option>
                <option value="Preventive">Preventive (Scheduled)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Scheduled Date */}
            {formData.type === 'Preventive' && (
              <div>
                <label htmlFor="scheduled_date" className="form-label">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  id="scheduled_date"
                  name="scheduled_date"
                  className={`form-input ${errors.scheduled_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.scheduled_date}
                  onChange={handleChange}
                />
                {errors.scheduled_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`form-textarea ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Detailed description of the issue or maintenance requirements"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-textarea"
                placeholder="Any additional information or special instructions"
                value={formData.notes}
                onChange={handleChange}
              />
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
              disabled={saving || !selectedEquipment}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="spinner h-4 w-4 mr-2"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEdit ? 'Update Request' : 'Create Request'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Smart Information */}
      {selectedEquipment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">ERP Smart Information</h3>
          <div className="text-sm text-yellow-700">
            <p>• Team assignment will be based on the selected equipment's maintenance team</p>
            <p>• Technicians will be assigned from the appropriate team</p>
            <p>• This request will appear in the Kanban board and calendar views</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceForm;
