// Calendar View Component - Preventive Maintenance Calendar
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MaintenanceService } from '../../services/api';

// Icons
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Calendar Event Component
const CalendarEvent = ({ event, onClick }) => {
  const getEventColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 border-red-300 text-red-800',
      'High': 'bg-orange-100 border-orange-300 text-orange-800',
      'Medium': 'bg-blue-100 border-blue-300 text-blue-800',
      'Low': 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const isOverdue = () => {
    if (event.type !== 'Preventive' || event.status === 'Repaired') return false;
    return new Date(event.scheduled_date) < new Date();
  };

  return (
    <div
      onClick={() => onClick(event)}
      className={`calendar-event border-l-4 cursor-pointer hover:shadow-sm transition-shadow duration-200 ${getEventColor(event.priority)} ${
        isOverdue() ? 'ring-2 ring-red-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{event.subject}</p>
          <p className="text-xs opacity-75 truncate">{event.equipment_name}</p>
          {event.technician_name && (
            <p className="text-xs opacity-60 truncate">👤 {event.technician_name}</p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {isOverdue() && (
            <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />
          )}
          <span className="text-xs font-medium">
            {event.type === 'Preventive' ? 'P' : 'C'}
          </span>
        </div>
      </div>
      {isOverdue() && (
        <div className="mt-1 text-xs text-red-600 font-medium">
          ⚠️ Overdue
        </div>
      )}
    </div>
  );
};

// Calendar Day Component
const CalendarDay = ({ date, events, currentMonth, onEventClick, onDateClick }) => {
  const isToday = () => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = () => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.scheduled_date);
    return eventDate.toDateString() === date.toDateString();
  });

  return (
    <div
      className={`min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isCurrentMonth() ? 'bg-gray-50 text-gray-400' : 'bg-white'
      } ${isToday() ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onDateClick(date)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isToday() ? 'text-blue-600' : ''}`}>
          {date.getDate()}
        </span>
        {dayEvents.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
            {dayEvents.length}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {dayEvents.slice(0, 2).map((event) => (
          <CalendarEvent
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
        {dayEvents.length > 2 && (
          <div className="text-xs text-gray-500 text-center">
            +{dayEvents.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
};

// Event Detail Modal
const EventDetailModal = ({ event, onClose, onUpdateStatus }) => {
  if (!event) return null;

  const isOverdue = () => {
    if (event.type !== 'Preventive' || event.status === 'Repaired') return false;
    return new Date(event.scheduled_date) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Maintenance Request Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{event.subject}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Equipment:</span>
                  <p className="text-gray-600">{event.equipment_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'Corrective' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {event.type}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    event.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    event.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.priority}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 'Repaired' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Scheduled:</span>
                  <p className="text-gray-600">
                    {new Date(event.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Team:</span>
                  <p className="text-gray-600">{event.team_name || 'Not Assigned'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Technician:</span>
                  <p className="text-gray-600">{event.technician_name || 'Unassigned'}</p>
                </div>
              </div>

              {isOverdue() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      This maintenance is overdue!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto sm:ml-3"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, onFiltersChange, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleClear = () => {
    const clearedFilters = {
      priority: '',
      status: '',
      team_id: '',
      show_overdue_only: false
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onApply();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            className="form-select"
            value={localFilters.priority || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              priority: e.target.value
            }))}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="form-select"
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              status: e.target.value
            }))}
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="show_overdue_only"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={localFilters.show_overdue_only || false}
            onChange={(e) => setLocalFilters(prev => ({
              ...prev,
              show_overdue_only: e.target.checked
            }))}
          />
          <label htmlFor="show_overdue_only" className="ml-2 text-sm text-gray-700">
            Show overdue only
          </label>
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={handleApply}
            className="btn-primary"
          >
            Apply Filters
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

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    show_overdue_only: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate, filters]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      
      // Get date range for current month
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await MaintenanceService.getCalendarData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      if (response.success) {
        let events = response.data || [];
        
        // Apply filters
        if (filters.priority) {
          events = events.filter(event => event.priority === filters.priority);
        }
        
        if (filters.status) {
          events = events.filter(event => event.status === filters.status);
        }
        
        if (filters.show_overdue_only) {
          const now = new Date();
          events = events.filter(event => {
            if (event.type !== 'Preventive' || event.status === 'Repaired') return false;
            return new Date(event.scheduled_date) < now;
          });
        }
        
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date) => {
    // Could open a form to create new maintenance request for this date
    console.log('Date clicked:', date);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-600">
            Schedule and track preventive maintenance activities
          </p>
        </div>
        <button
          onClick={loadCalendarEvents}
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="btn-primary"
          >
            Today
          </button>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApply={loadCalendarEvents}
        />

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center">
              <span className="text-sm font-medium text-gray-700">{day}</span>
            </div>
          ))}
          
          {/* Calendar days */}
          {generateCalendarDays().map((date, index) => (
            <CalendarDay
              key={index}
              date={date}
              events={calendarEvents}
              currentMonth={currentDate}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border-l-4 border-red-400 rounded mr-2"></div>
            <span>Critical Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 border-l-4 border-orange-400 rounded mr-2"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border-l-4 border-blue-400 rounded mr-2"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 border-l-4 border-gray-400 rounded mr-2"></div>
            <span>Low Priority</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <p>• Click on events to view details</p>
          <p>• Red outline indicates overdue preventive maintenance</p>
          <p>• P = Preventive, C = Corrective maintenance</p>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;
