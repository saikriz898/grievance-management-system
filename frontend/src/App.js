import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Components
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import UserAccess from './pages/UserAccess';
import UserRoleSelection from './pages/UserRoleSelection';
import UserLoginSelection from './pages/UserLoginSelection';

import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import FacultyLogin from './pages/FacultyLogin';
import FacultyRegister from './pages/FacultyRegister';
import StaffLogin from './pages/StaffLogin';
import StaffRegister from './pages/StaffRegister';
import Dashboard from './pages/Dashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import TrackGrievance from './pages/TrackGrievance';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardEnhanced from './pages/AdminDashboardEnhanced';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminLanding from './pages/AdminLanding';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import MyGrievances from './pages/MyGrievances';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import AdminReports from './pages/AdminReports';


import GrievanceDetail from './pages/GrievanceDetail';
import FloatingMessageButton from './components/FloatingMessageButton';
import NotificationSystem from './components/NotificationSystem';
import AIChatbot from './components/AIChatbot';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const { isAuthenticated, user, restoreSession } = useAuthStore();
  
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
            <Navbar />
            <Toaster position="top-right" />
          
          <PageLoader>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<TrackGrievance />} />
          
          {/* Public Routes */}
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/user-access" element={<UserAccess />} />
          <Route path="/user/role-selection" element={<UserRoleSelection />} />
          <Route path="/user/login-selection" element={<UserLoginSelection />} />
          <Route 
            path="/student/login" 
            element={!isAuthenticated ? <StudentLogin /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/student/register" 
            element={!isAuthenticated ? <StudentRegister /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/faculty/login" 
            element={!isAuthenticated ? <FacultyLogin /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/faculty/register" 
            element={!isAuthenticated ? <FacultyRegister /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/staff/login" 
            element={!isAuthenticated ? <StaffLogin /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/staff/register" 
            element={!isAuthenticated ? <StaffRegister /> : <Navigate to="/dashboard" />} 
          />

          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/submit-grievance" 
            element={<ProtectedRoute><SubmitGrievance /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />
          <Route 
            path="/my-grievances" 
            element={<ProtectedRoute><MyGrievances /></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute><Settings /></ProtectedRoute>} 
          />

          <Route 
            path="/grievance/:id" 
            element={<ProtectedRoute><GrievanceDetail /></ProtectedRoute>} 
          />
          
          {/* Admin Routes */}
          <Route path="/admin-access" element={<AdminLanding />} />
          <Route 
            path="/admin/login" 
            element={isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin" /> : <AdminLogin />} 
          />
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} 
          />

          <Route 
            path="/admin/analytics" 
            element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/settings" 
            element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/reports" 
            element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/enhanced" 
            element={<ProtectedRoute adminOnly><AdminDashboardEnhanced /></ProtectedRoute>} 
          />
          
          {/* Help Route */}
          <Route path="/help" element={<Help />} />
          
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageLoader>
        
          <FloatingMessageButton />
          <NotificationSystem />
          {isAuthenticated && <AIChatbot user={user} />}
        </div>
      </Router>
    </ErrorBoundary>
  </ThemeProvider>
  );
}

export default App;