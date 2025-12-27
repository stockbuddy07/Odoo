// Team List Page - Display all maintenance teams
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TeamService } from '../../services/api';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Team Status Badge
const TeamStatusBadge = ({ isActive }) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircleIcon className="h-3 w-3 mr-1" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <XCircleIcon className="h-3 w-3 mr-1" />
      Inactive
    </span>
  );
};

// Action Buttons Component
const ActionButtons = ({ team, user, onDelete, onToggleStatus }) => {
  const canEdit = ['Manager', 'Admin'].includes(user?.role);
  const canDelete = user?.role === 'Admin';

  return (
    <div className="flex items-center space-x-2">
      {canEdit && (
        <Link
          to={`/teams/${team.id}/edit`}
          className="text-blue-600 hover:text-blue-800"
          title="Edit Team"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      )}
      {canEdit && (
        <button
          onClick={() => onToggleStatus(team.id)}
          className={`${team.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
          title={team.is_active ? 'Deactivate Team' : 'Activate Team'}
        >
          {team.is_active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
        </button>
      )}
      {canDelete && (
        <button
          onClick={() => onDelete(team.id)}
          className="text-red-600 hover:text-red-800"
          title="Delete Team"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Search and Filter Component
const SearchFilter = ({ filters, onFiltersChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = () => {
    onFiltersChange({
      search: searchTerm,
      status
    });
    onSearch();
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatus('');
    onFiltersChange({
      search: '',
      status: ''
    });
    onSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Teams
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Team name or description"
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={handleSearch}
            className="btn-primary flex-1"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

// Team Member Component
const TeamMemberList = ({ team }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
      >
        <UsersIcon className="h-4 w-4 mr-1" />
        {team.member_count} members
        <span className="ml-1">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && team.members && (
        <div className="mt-2 pl-5 space-y-1">
          {team.members.map((member, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              {member.user_name}
              {member.is_lead && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Lead
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamList = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadTeams();
  }, [filters, pagination.page]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setTeams(response.data.teams || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / pagination.limit)
        }));
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    loadTeams();
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await TeamService.delete(teamId);
      if (response.success) {
        loadTeams();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleToggleStatus = async (teamId) => {
    try {
      // This would require a separate API endpoint for toggling status
      // For now, we'll just reload the teams
      loadTeams();
    } catch (error) {
      console.error('Error toggling team status:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const canCreate = ['Manager', 'Admin'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Teams</h1>
          <p className="text-gray-600">Manage maintenance teams and their members</p>
        </div>
        {canCreate && (
          <Link to="/teams/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Team
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <SearchFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead className="bg-gray-50">
              <tr>
                <th>Team</th>
                <th>Description</th>
                <th>Members</th>
                <th>Equipment Assigned</th>
                <th>Active Requests</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="spinner h-6 w-6 mx-auto"></div>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No teams found
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.team_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {team.description || 'No description'}
                      </div>
                    </td>
                    <td>
                      <TeamMemberList team={team} />
                    </td>
                    <td className="text-sm text-gray-900">
                      {team.equipment_count || 0}
                    </td>
                    <td className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          team.active_requests > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.active_requests || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <TeamStatusBadge isActive={team.is_active} />
                    </td>
                    <td className="text-sm text-gray-900">
                      {new Date(team.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <ActionButtons 
                        team={team} 
                        user={user} 
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center px-3 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-semibold text-gray-900">{teams.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Teams</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teams.filter(t => t.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teams.reduce((sum, team) => sum + (team.member_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Members/Team</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teams.length > 0 ? Math.round(teams.reduce((sum, team) => sum + (team.member_count || 0), 0) / teams.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamList;
