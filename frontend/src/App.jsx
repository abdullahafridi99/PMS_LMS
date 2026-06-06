import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';

// Import specific login/signup pages
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import ParentLogin from './pages/ParentLogin';
import ParentSignup from './pages/ParentSignup';

// Secure Route Guard to enforce proper JWT access with specific role redirection
const PrivateRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token || !user) {
    const loginRedirect = allowedRole === 'admin' ? '/admin-login' : allowedRole === 'student' ? '/student-login' : '/parent-login';
    return <Navigate to={loginRedirect} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const loginRedirect = allowedRole === 'admin' ? '/admin-login' : allowedRole === 'student' ? '/student-login' : '/parent-login';
    return <Navigate to={loginRedirect} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Homepage Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Portal Hub Selection Gateway */}
        <Route path="/login" element={<LoginPage />} />

        {/* Separate Login/Signup pages */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />

        <Route path="/parent-login" element={<ParentLogin />} />
        <Route path="/parent-signup" element={<ParentSignup />} />

        {/* Protected Dashboard Portals */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/student" 
          element={
            <PrivateRoute allowedRole="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/parent" 
          element={
            <PrivateRoute allowedRole="parent">
              <ParentDashboard />
            </PrivateRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
