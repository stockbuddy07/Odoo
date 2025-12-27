// Main App Component with Routing
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Components
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';

// Dashboard and Main Components
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentForm from './pages/equipment/EquipmentForm';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import MaintenanceForm from './pages/maintenance/MaintenanceForm';
import KanbanView from './pages/maintenance/KanbanView';
import CalendarView from './pages/maintenance/CalendarView';
import TeamList from './pages/teams/TeamList';
import TeamForm from './pages/teams/TeamForm';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role_id) {
    const roleHierarchy = {
      'User': 1,
      'Technician': 2,
      'Manager': 3,
      'Admin': 4
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Equipment Routes */}
        <Route path="/equipment" element={
          <ProtectedRoute requiredRole="User">
            <MainLayout>
              <EquipmentList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/equipment/new" element={
          <ProtectedRoute requiredRole="Manager">
            <MainLayout>
              <EquipmentForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/equipment/:id/edit" element={
          <ProtectedRoute requiredRole="Manager">
            <MainLayout>
              <EquipmentForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Maintenance Routes */}
        <Route path="/maintenance" element={
          <ProtectedRoute requiredRole="User">
            <MainLayout>
              <MaintenanceList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/maintenance/new" element={
          <ProtectedRoute requiredRole="User">
            <MainLayout>
              <MaintenanceForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/maintenance/kanban" element={
          <ProtectedRoute requiredRole="Technician">
            <MainLayout>
              <KanbanView />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/maintenance/calendar" element={
          <ProtectedRoute requiredRole="User">
            <MainLayout>
              <CalendarView />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Team Routes */}
        <Route path="/teams" element={
          <ProtectedRoute requiredRole="User">
            <MainLayout>
              <TeamList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/teams/new" element={
          <ProtectedRoute requiredRole="Manager">
            <MainLayout>
              <TeamForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/teams/:id/edit" element={
          <ProtectedRoute requiredRole="Manager">
            <MainLayout>
              <TeamForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
