// Kanban View Component - Drag & Drop Maintenance Board
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceService } from '../../services/api';
import { useDrag, useDrop } from 'react-dnd';
import toast from 'react-hot-toast';

// Icons
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Kanban Columns Configuration
const KANBAN_COLUMNS = [
  { 
    id: 'New', 
    title: 'New Requests', 
    color: 'bg-blue-100 border-blue-300',
    icon: ExclamationTriangleIcon,
    description: 'Fresh maintenance requests'
  },
  { 
    id: 'In Progress', 
    title: 'In Progress', 
    color: 'bg-yellow-100 border-yellow-300',
    icon: ClockIcon,
    description: 'Currently being worked on'
  },
  { 
    id: 'Repaired', 
    title: 'Repaired', 
    color: 'bg-green-100 border-green-300',
    icon: CheckCircleIcon,
    description: 'Completed repairs'
  },
  { 
    id: 'Scrap', 
    title: 'Scrap', 
    color: 'bg-red-100 border-red-300',
    icon: XCircleIcon,
    description: 'Equipment marked for disposal'
  }
];

// Kanban Card Component
const KanbanCard = ({ request, onStatusUpdate, user }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'maintenance-request',
    item: { id: request.id, status: request.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [request.id, request.status]);

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'border-l-gray-400',
      'Medium': 'border-l-blue-400',
      'High': 'border-l-orange-400',
      'Critical': 'border-l-red-400'
    };
    return colors[priority] || 'border-l-gray-400';
  };

  const canUpdateStatus = () => {
    // Technicians can update assigned requests
    // Managers and Admins can update any request
    return user?.role === 'Manager' || user?.role === 'Admin' || 
           (user?.role === 'Technician' && request.technician_id === user?.id);
  };

  return (
    <div
      ref={drag}
      className={`kanban-card ${isDragging ? 'opacity-50' : ''} border-l-4 ${getPriorityColor(request.priority)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
          {request.subject}
        </h4>
        <div className="flex items-center space-x-1 ml-2">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
            request.type === 'Corrective' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {request.type === 'Corrective' ? 'C' : 'P'}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
            request.priority === 'Critical' ? 'bg-red-100 text-red-800' :
            request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
            request.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {request.priority.charAt(0)}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {request.description}
      </p>
      
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center">
          <WrenchScrewdriverIcon className="h-3 w-3 mr-1" />
          <span className="truncate">{request.equipment_name || 'No Equipment'}</span>
        </div>
        
        {request.technician_name && (
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            <span className="truncate">{request.technician_name}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span>{new Date(request.created_at).toLocaleDateString()}</span>
          {request.scheduled_date && (
            <span className="text-orange-600">
              Due: {new Date(request.scheduled_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {canUpdateStatus() && request.status === 'In Progress' && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => onStatusUpdate(request.id, 'Repaired')}
              className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            >
              Mark Repaired
            </button>
            <button
              onClick={() => onStatusUpdate(request.id, 'Scrap')}
              className="flex-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Mark Scrap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ column, requests, onDrop, user }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'maintenance-request',
    drop: (item) => {
      if (item.status !== column.id) {
        onDrop(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [column.id, onDrop]);

  const canUpdateStatus = (request) => {
    return user?.role === 'Manager' || user?.role === 'Admin' || 
           (user?.role === 'Technician' && request.technician_id === user?.id);
  };

  return (
    <div className={`flex-1 min-h-96 ${column.color} rounded-lg p-4 ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <column.icon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-medium text-gray-900">{column.title}</h3>
        </div>
        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
          {requests.length}
        </span>
      </div>
      
      <div className="text-xs text-gray-600 mb-4">
        {column.description}
      </div>

      <div ref={drop} className="space-y-3 min-h-64">
        {requests.map((request) => (
          <KanbanCard
            key={request.id}
            request={request}
            onStatusUpdate={onDrop}
            user={user}
          />
        ))}
        
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <column.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, onFiltersChange, onApply, user }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleClear = () => {
    const clearedFilters = {
      assigned_to_me: false,
      equipment_id: '',
      team_id: '',
      priority: '',
      date_from: '',
      date_to: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onApply();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="assigned_to_me"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={localFilters.assigned_to_me || false}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              assigned_to_me: e.target.checked
            }))}
          />
          <label htmlFor="assigned_to_me" className="ml-2 text-sm text-gray-700">
            Assigned to me
          </label>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            className="form-select text-sm"
            value={localFilters.priority || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              priority: e.target.value
            }))}
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            className="form-input text-sm"
            value={localFilters.date_from || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              date_from: e.target.value
            }))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            className="form-input text-sm"
            value={localFilters.date_to || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              date_to: e.target.value
            }))}
          />
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={handleApply}
            className="btn-primary text-sm"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

const KanbanView = () => {
  const { user } = useAuth();
  const [kanbanData, setKanbanData] = useState({});
  const [filters, setFilters] = useState({
    assigned_to_me: false,
    priority: '',
    date_from: '',
    date_to: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadKanbanData();
  }, [filters]);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      const response = await MaintenanceService.getKanbanData(filters);
      
      if (response.success) {
        setKanbanData(response.data || {});
      }
    } catch (error) {
      console.error('Error loading Kanban data:', error);
      toast.error('Failed to load Kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setUpdating(true);
      const response = await MaintenanceService.updateStatus(requestId, newStatus);
      
      if (response.success) {
        toast.success('Status updated successfully');
        loadKanbanData(); // Refresh the board
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600">
            Visual workflow management - Drag and drop requests between columns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {updating && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="spinner h-4 w-4 mr-2"></div>
              Updating...
            </div>
          )}
          <button
            onClick={loadKanbanData}
            className="btn-secondary"
            disabled={updating}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={loadKanbanData}
        user={user}
      />

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            requests={kanbanData[column.id] || []}
            onDrop={handleStatusUpdate}
            user={user}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How to use the Kanban Board</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Drag & Drop:</strong> Move requests between columns to update their status</p>
          <p>• <strong>Technicians:</strong> Can update status for assigned requests only</p>
          <p>• <strong>Managers/Admins:</strong> Can update any request status</p>
          <p>• <strong>Filters:</strong> Use the filter panel to focus on specific requests</p>
          <p>• <strong>Priority Colors:</strong> Left border indicates priority (Gray=Low, Blue=Medium, Orange=High, Red=Critical)</p>
        </div>
      </div>
    </div>
  );
};

export default KanbanView;
