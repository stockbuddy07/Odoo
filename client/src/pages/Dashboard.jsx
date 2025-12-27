// Dashboard Component - Main ERP Overview
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EquipmentService, MaintenanceService, TeamService } from '../services/api';

// Icons
import {
  CogIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, link }) => {
  const content = (
    <div className="erp-card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

// Recent Activity Component
const RecentActivity = ({ activities }) => {
  return (
    <div className="erp-card">
      <div className="erp-card-header">
        <h3 className="erp-card-title">Recent Activity</h3>
        <Link
          to="/maintenance"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ user }) => {
  const actions = [];

  // Add actions based on user role
  if (['User', 'Technician', 'Manager', 'Admin'].includes(user?.role)) {
    actions.push({
      title: 'New Maintenance Request',
      description: 'Report equipment issue',
      icon: WrenchScrewdriverIcon,
      link: '/maintenance/new',
      color: 'bg-blue-600 hover:bg-blue-700'
    });
  }

  if (['Manager', 'Admin'].includes(user?.role)) {
    actions.push({
      title: 'Add Equipment',
      description: 'Register new equipment',
      icon: CogIcon,
      link: '/equipment/new',
      color: 'bg-green-600 hover:bg-green-700'
    });
  }

  if (['Manager', 'Admin'].includes(user?.role)) {
    actions.push({
      title: 'Manage Teams',
      description: 'Organize technicians',
      icon: UsersIcon,
      link: '/teams',
      color: 'bg-purple-600 hover:bg-purple-700'
    });
  }

  return (
    <div className="erp-card">
      <div className="erp-card-header">
        <h3 className="erp-card-title">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className={`p-2 rounded-lg ${action.color} mr-4`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    equipment: { total: 0, active: 0 },
    maintenance: { total: 0, new: 0, inProgress: 0, repaired: 0 },
    teams: { total: 0, active: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics in parallel
      const [equipmentStats, maintenanceStats, teamStats] = await Promise.all([
        EquipmentService.getStats(),
        MaintenanceService.getStats(),
        TeamService.getStats()
      ]);

      if (equipmentStats.success) {
        setStats(prev => ({
          ...prev,
          equipment: equipmentStats.data.overview || prev.equipment
        }));
      }

      if (maintenanceStats.success) {
        setStats(prev => ({
          ...prev,
          maintenance: maintenanceStats.data.overview || prev.maintenance
        }));
        
        // Set recent activity
        if (maintenanceStats.data.recent_activity) {
          setRecentActivity(
            maintenanceStats.data.recent_activity.map(activity => ({
              description: `${activity.subject} - ${activity.status}`,
              timestamp: new Date(activity.updated_at).toLocaleString()
            }))
          );
        }
      }

      if (teamStats.success) {
        setStats(prev => ({
          ...prev,
          teams: teamStats.data.overview || prev.teams
        }));
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your maintenance operations today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-lg font-semibold text-blue-600">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Equipment"
          value={stats.equipment.total || 0}
          icon={CogIcon}
          color="bg-blue-600"
          link="/equipment"
        />
        <StatCard
          title="Active Requests"
          value={(stats.maintenance.new || 0) + (stats.maintenance.inProgress || 0)}
          icon={WrenchScrewdriverIcon}
          color="bg-yellow-600"
          link="/maintenance"
        />
        <StatCard
          title="Completed Today"
          value={stats.maintenance.repaired || 0}
          icon={CheckCircleIcon}
          color="bg-green-600"
          link="/maintenance"
        />
        <StatCard
          title="Active Teams"
          value={stats.teams.active || 0}
          icon={UsersIcon}
          color="bg-purple-600"
          link="/teams"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions user={user} />
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.maintenance.new > 0 || stats.maintenance.inProgress > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Maintenance Alerts
              </h3>
              <p className="text-sm text-yellow-700">
                You have {stats.maintenance.new} new and {stats.maintenance.inProgress} in-progress maintenance requests.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
