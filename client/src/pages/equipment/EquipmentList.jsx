// Equipment List Page - Display all equipment with filtering and actions
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EquipmentService } from '../../services/api';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Status Badge Component
const StatusBadge = ({ isScrapped }) => {
  if (isScrapped) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Scrapped
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircleIcon className="h-3 w-3 mr-1" />
      Active
    </span>
  );
};

// Action Buttons Component
const ActionButtons = ({ equipment, user, onDelete }) => {
  const canEdit = ['Manager', 'Admin'].includes(user?.role);
  const canDelete = user?.role === 'Admin';

  return (
    <div className="flex items-center space-x-2">
      {canEdit && (
        <Link
          to={`/equipment/${equipment.id}/edit`}
          className="text-blue-600 hover:text-blue-800"
          title="Edit Equipment"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      )}
      {canDelete && !equipment.is_scrapped && (
        <button
          onClick={() => onDelete(equipment.id)}
          className="text-red-600 hover:text-red-800"
          title="Delete Equipment"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Search and Filter Component
const SearchFilter = ({ filters, onFiltersChange, onSearch, equipmentOptions }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [department, setDepartment] = useState(filters.department || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = () => {
    onFiltersChange({
      search: searchTerm,
      department,
      status
    });
    onSearch();
  };

  const handleClear = () => {
    setSearchTerm('');
    setDepartment('');
    setStatus('');
    onFiltersChange({
      search: '',
      department: '',
      status: ''
    });
    onSearch();
  };

  // Get unique departments
  const departments = [...new Set(
    equipmentOptions?.data?.map(eq => eq.department).filter(Boolean)
  )] || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Equipment name or serial number"
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
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
            <option value="scrapped">Scrapped</option>
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

const EquipmentList = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadEquipment();
    loadEquipmentOptions();
  }, [filters, pagination.page]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await EquipmentService.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setEquipment(response.data.equipment || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / pagination.limit)
        }));
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipmentOptions = async () => {
    try {
      const response = await EquipmentService.getOptions();
      if (response.success) {
        setEquipmentOptions(response);
      }
    } catch (error) {
      console.error('Error loading equipment options:', error);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    loadEquipment();
  };

  const handleDelete = async (equipmentId) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      const response = await EquipmentService.delete(equipmentId);
      if (response.success) {
        loadEquipment();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Manage all company equipment and assets</p>
        </div>
        {canCreate && (
          <Link to="/equipment/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Equipment
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <SearchFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        equipmentOptions={equipmentOptions}
      />

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead className="bg-gray-50">
              <tr>
                <th>Equipment</th>
                <th>Serial Number</th>
                <th>Department</th>
                <th>Location</th>
                <th>Team</th>
                <th>Status</th>
                <th>Warranty End</th>
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
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No equipment found
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center">
                        <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.assigned_employee}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">
                      {item.serial_number}
                    </td>
                    <td className="text-sm text-gray-900">
                      {item.department}
                    </td>
                    <td className="text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="text-sm text-gray-900">
                      {item.maintenance_team_name || 'Not Assigned'}
                    </td>
                    <td>
                      <StatusBadge isScrapped={item.is_scrapped} />
                    </td>
                    <td className="text-sm text-gray-900">
                      {item.warranty_end ? 
                        new Date(item.warranty_end).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td>
                      <ActionButtons 
                        equipment={item} 
                        user={user} 
                        onDelete={handleDelete} 
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
    </div>
  );
};

export default EquipmentList;
