// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Allergy from './pages/student/Allergy';
import Appointments from './pages/student/Appointments';
import Notifications from './pages/student/Notifications';
import LoginHistory from './pages/student/LoginHistory';
import VisitHistory from './pages/student/VisitHistory';
import DeleteAccount from './pages/student/DeleteAccount';

import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageVisits from './pages/admin/ManageVisits';
import ManageAppointments from './pages/admin/ManageAppointments';
import SearchHistory from './pages/admin/SearchHistory';
import SendNotification from './pages/admin/SendNotification';
import Statistics from './pages/admin/Statistics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
          <Route path="/student/allergy" element={<ProtectedRoute role="student"><Allergy /></ProtectedRoute>} />
          <Route path="/student/appointments" element={<ProtectedRoute role="student"><Appointments /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute role="student"><Notifications /></ProtectedRoute>} />
          <Route path="/student/login-history" element={<ProtectedRoute role="student"><LoginHistory /></ProtectedRoute>} />
          <Route path="/student/visit-history" element={<ProtectedRoute role="student"><VisitHistory /></ProtectedRoute>} />
          <Route path="/student/delete-account" element={<ProtectedRoute role="student"><DeleteAccount /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute role="nurse"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/manage-students" element={<ProtectedRoute role="nurse"><ManageStudents /></ProtectedRoute>} />
          <Route path="/admin/manage-visits" element={<ProtectedRoute role="nurse"><ManageVisits /></ProtectedRoute>} />
          <Route path="/admin/manage-appointments" element={<ProtectedRoute role="nurse"><ManageAppointments /></ProtectedRoute>} />
          <Route path="/admin/search-history" element={<ProtectedRoute role="nurse"><SearchHistory /></ProtectedRoute>} />
          <Route path="/admin/send-notification" element={<ProtectedRoute role="nurse"><SendNotification /></ProtectedRoute>} />
          <Route path="/admin/statistics" element={<ProtectedRoute role="nurse"><Statistics /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
