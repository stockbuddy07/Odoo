// Maintenance List Page - Display all maintenance requests
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceService } from '../../services/api';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    'New': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Repaired': 'bg-green-100 text-green-800',
    'Scrap': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const styles = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority}
    </span>
  );
};

// Type Badge Component
const TypeBadge = ({ type }) => {
  const styles = {
    'Corrective': 'bg-red-100 text-red-800',
    'Preventive': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
};

// View Toggle Component
const ViewToggle = ({ view, onViewChange }) => {
  const views = [
    { key: 'list', label: 'List View', icon: WrenchScrewdriverIcon },
    { key: 'kanban', label: 'Kanban Board', icon: ChartBarIcon },
    { key: 'calendar', label: 'Calendar View', icon: CalendarIcon }
  ];

  return (
    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
      <nav className="flex space-x-1">
        {views.map((viewOption) => (
          <button
            key={viewOption.key}
            onClick={() => onViewChange(viewOption.key)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              view === viewOption.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <viewOption.icon className="h-4 w-4 mr-2" />
            {viewOption.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Search and Filter Component
const SearchFilter = ({ filters, onFiltersChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [type, setType] = useState(filters.type || '');
  const [priority, setPriority] = useState(filters.priority || '');

  const handleSearch = () => {
    onFiltersChange({
      search: searchTerm,
      status,
      type,
      priority
    });
    onSearch();
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatus('');
    setType('');
    setPriority('');
    onFiltersChange({
      search: '',
      status: '',
      type: '',
      priority: ''
    });
    onSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Subject or description"
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
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
            <option value="Scrap">Scrap</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Corrective">Corrective</option>
            <option value="Preventive">Preventive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
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

const MaintenanceList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({});
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadRequests();
  }, [filters, pagination.page]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await MaintenanceService.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setRequests(response.data.requests || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / pagination.limit)
        }));
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    loadRequests();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const canCreate = ['User', 'Technician', 'Manager', 'Admin'].includes(user?.role);

  // Redirect to appropriate view
  if (view === 'kanban') {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-gray-600">Kanban board view of all maintenance requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <ViewToggle view={view} onViewChange={handleViewChange} />
            {canCreate && (
              <Link to="/maintenance/new" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Request
              </Link>
            )}
          </div>
        </div>
        
        {/* Kanban Board Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kanban Board</h3>
          <p className="text-gray-500 mb-4">
            This feature requires the KanbanView component to be fully implemented.
          </p>
          <Link to="/maintenance/kanban" className="btn-primary">
            View Kanban Board
          </Link>
        </div>
      </div>
    );
  }

  if (view === 'calendar') {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-gray-600">Calendar view of preventive maintenance schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <ViewToggle view={view} onViewChange={handleViewChange} />
            {canCreate && (
              <Link to="/maintenance/new" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Request
              </Link>
            )}
          </div>
        </div>
        
        {/* Calendar View Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-500 mb-4">
            This feature requires the CalendarView component to be fully implemented.
          </p>
          <Link to="/maintenance/calendar" className="btn-primary">
            View Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600">Manage all maintenance and repair requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          {canCreate && (
            <Link to="/maintenance/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Request
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <SearchFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead className="bg-gray-50">
              <tr>
                <th>Request</th>
                <th>Equipment</th>
                <th>Team</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Technician</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="spinner h-6 w-6 mx-auto"></div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No maintenance requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.subject}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">
                      {request.equipment_name || 'N/A'}
                    </td>
                    <td className="text-sm text-gray-900">
                      {request.team_name || 'Not Assigned'}
                    </td>
                    <td>
                      <TypeBadge type={request.type} />
                    </td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={request.priority} />
                    </td>
                    <td className="text-sm text-gray-900">
                      {request.technician_name || 'Unassigned'}
                    </td>
                    <td className="text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/maintenance/${request.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        {(user?.role === 'Manager' || user?.role === 'Admin' || request.created_by === user?.id) && (
                          <Link
                            to={`/maintenance/${request.id}/edit`}
                            className="text-green-600 hover:text-green-800"
                            title="Edit Request"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
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
    </div>
  );
};

export default MaintenanceList;
