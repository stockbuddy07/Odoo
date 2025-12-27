// Team Form Page - Create/Edit Maintenance Teams
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TeamService } from '../../services/api';
import toast from 'react-hot-toast';

// Icons
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';

const TeamForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    team_name: '',
    description: '',
    is_active: true
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadTeam();
    }
    loadAvailableUsers();
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getById(id);
      if (response.success) {
        const team = response.data;
        setFormData({
          team_name: team.team_name || '',
          description: team.description || '',
          is_active: team.is_active !== false
        });
        setTeamMembers(team.members || []);
      }
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error('Failed to load team');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // This would require an API endpoint to get available users
      // For now, we'll use a mock structure
      setAvailableUsers([
        { id: 3, name: 'Rahul Technician', role: 'Technician' },
        { id: 4, name: 'Priya Technician', role: 'Technician' },
        { id: 5, name: 'Amit Employee', role: 'User' }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.team_name.trim()) {
      newErrors.team_name = 'Team name is required';
    } else if (formData.team_name.length < 3) {
      newErrors.team_name = 'Team name must be at least 3 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
        response = await TeamService.update(id, formData);
      } else {
        response = await TeamService.create(formData);
      }

      if (response.success) {
        toast.success(isEdit ? 'Team updated successfully' : 'Team created successfully');
        navigate('/teams');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      const message = error.message || 'Failed to save team';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  const handleAddMember = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user && !teamMembers.find(m => m.user_id === userId)) {
      setTeamMembers(prev => [...prev, {
        id: Date.now(), // Temporary ID for new members
        user_id: userId,
        user_name: user.name,
        is_lead: false
      }]);
    }
  };

  const handleRemoveMember = (memberId) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleToggleLead = (memberId) => {
    setTeamMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, is_lead: !m.is_lead } : m
    ));
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
            {isEdit ? 'Edit Team' : 'Create New Team'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update team information and members' : 'Create a new maintenance team'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Name */}
            <div>
              <label htmlFor="team_name" className="form-label">
                Team Name *
              </label>
              <input
                type="text"
                id="team_name"
                name="team_name"
                className={`form-input ${errors.team_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., Mechanical Team, Electrical Team"
                value={formData.team_name}
                onChange={handleChange}
              />
              {errors.team_name && (
                <p className="mt-1 text-sm text-red-600">{errors.team_name}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center mt-8">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Team is active
              </label>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className={`form-textarea ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Brief description of the team's responsibilities and expertise"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
            
            {/* Add Member */}
            <div className="mb-4">
              <label className="form-label">Add Member</label>
              <div className="flex space-x-4">
                <select
                  className="form-select flex-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMember(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Select user to add</option>
                  {availableUsers
                    .filter(user => !teamMembers.find(m => m.user_id === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Members</h4>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No members added yet</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {member.user_name}
                          </span>
                          {member.is_lead && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Team Lead
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLead(member.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {member.is_lead ? 'Remove Lead' : 'Make Lead'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                isEdit ? 'Update Team' : 'Create Team'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Team Management Tips</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Teams will be automatically assigned to equipment based on their specialization</p>
          <p>• Each equipment can only be assigned to one maintenance team</p>
          <p>• Team leads have additional privileges for managing team activities</p>
          <p>• Members can belong to multiple teams if they have diverse skills</p>
        </div>
      </div>
    </div>
  );
};

export default TeamForm;
