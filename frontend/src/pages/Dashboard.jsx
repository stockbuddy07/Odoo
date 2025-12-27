import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Settings, BarChart3, Calendar, MessageSquare, Bell, TrendingUp, Users, Clock } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: 'Total Users',
      value: '2,345',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Sessions',
      value: '156',
      change: '+8%',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Growth Rate',
      value: '23%',
      change: '+4%',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Messages',
      value: '1,234',
      change: '+18%',
      icon: MessageSquare,
      color: 'orange'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'User registration', user: 'john@example.com', time: '2 minutes ago', type: 'user' },
    { id: 2, action: 'Profile updated', user: 'jane@example.com', time: '5 minutes ago', type: 'update' },
    { id: 3, action: 'New message sent', user: 'bob@example.com', time: '10 minutes ago', type: 'message' },
    { id: 4, action: 'Session started', user: 'alice@example.com', time: '15 minutes ago', type: 'session' },
    { id: 5, action: 'Password reset', user: 'mike@example.com', time: '20 minutes ago', type: 'security' }
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's what's happening with your account today.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Bell size={18} />
            Notifications
          </button>
          <button className="btn btn-primary">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" data-color={stat.color}>
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-tabs">
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} />
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp size={18} />
              Analytics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Clock size={18} />
              Activity
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="chart-placeholder">
                  <BarChart3 size={48} />
                  <h3>Analytics Chart</h3>
                  <p>Interactive charts and graphs will be displayed here</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-content">
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>User Growth</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <p>75% of monthly goal achieved</p>
                  </div>
                  <div className="analytics-card">
                    <h4>Conversion Rate</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '45%' }}></div>
                    </div>
                    <p>45% conversion rate this month</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-content">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon" data-type={activity.type}>
                        <User size={16} />
                      </div>
                      <div className="activity-details">
                        <p className="activity-action">{activity.action}</p>
                        <p className="activity-user">{activity.user}</p>
                      </div>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
