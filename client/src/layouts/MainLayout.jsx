// Main ERP Layout Component
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icons
import {
  HomeIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// User Menu Dropdown
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-400" />
        <span className="ml-2 text-gray-700 font-medium">{user?.name}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-xs text-blue-600 font-medium">{user?.role}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar Navigation
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['User', 'Technician', 'Manager', 'Admin'] },
    { name: 'Equipment', href: '/equipment', icon: CogIcon, roles: ['User', 'Technician', 'Manager', 'Admin'] },
    { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon, roles: ['User', 'Technician', 'Manager', 'Admin'] },
    { name: 'Kanban Board', href: '/maintenance/kanban', icon: ChartBarIcon, roles: ['Technician', 'Manager', 'Admin'] },
    { name: 'Calendar', href: '/maintenance/calendar', icon: ChartBarIcon, roles: ['User', 'Technician', 'Manager', 'Admin'] },
    { name: 'Teams', href: '/teams', icon: UsersIcon, roles: ['User', 'Technician', 'Manager', 'Admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-white text-lg font-semibold">GearGuard ERP</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="erp-layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="erp-main-content">
        {/* Header */}
        <header className="erp-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-2xl font-semibold text-gray-900 lg:ml-0">
                GearGuard ERP
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* User menu */}
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="erp-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
