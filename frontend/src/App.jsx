import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';

// Import specific login/signup pages
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import ParentLogin from './pages/ParentLogin';
import TeacherLogin from './pages/TeacherLogin';
import TeacherSignup from './pages/TeacherSignup';
import TeacherDashboard from './pages/TeacherDashboard';

import { SocketProvider } from './context/socket';
import { useAuthStore } from './store/authStore';

// Secure Route Guard to enforce proper JWT access with specific role redirection
const PrivateRoute = ({ children, allowedRole }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    const loginRedirect = allowedRole === 'admin' 
      ? '/admin-login' 
      : allowedRole === 'teacher' 
        ? '/teacher-login' 
        : allowedRole === 'student' 
          ? '/student-login' 
          : '/parent-login';
    return <Navigate to={loginRedirect} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const loginRedirect = allowedRole === 'admin' 
      ? '/admin-login' 
      : allowedRole === 'teacher' 
        ? '/teacher-login' 
        : allowedRole === 'student' 
          ? '/student-login' 
          : '/parent-login';
    return <Navigate to={loginRedirect} replace />;
  }

  return children;
};

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          {/* Public Homepage Route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Portal Hub Selection Gateway */}
          <Route path="/login" element={<LoginPage />} />

          {/* Separate Login/Signup pages */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/teacher-signup" element={<TeacherSignup />} />
          
          <Route path="/student-login" element={<StudentLogin />} />

          <Route path="/parent-login" element={<ParentLogin />} />

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

          <Route 
            path="/teacher" 
            element={
              <PrivateRoute allowedRole="teacher">
                <TeacherDashboard />
              </PrivateRoute>
            } 
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
