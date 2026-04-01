import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/Dashboard';
import StudentDrives from './pages/Student/Drives';
import DriveDetail from './pages/Student/DriveDetail';
import Experiences from './pages/Student/Experiences';
import MyApplications from './pages/Student/MyApplications';
import Profile from './pages/Student/Profile';
import StudentSettings from './pages/Student/Settings';

import TPODashboard from './pages/TPO/Dashboard';
import DriveCreate from './pages/TPO/DriveCreate';
import TPOShortlist from './pages/TPO/Shortlist';
import TPOStudents from './pages/TPO/Students';
import TPODrives from './pages/TPO/DrivesList';
import TPOExperiences from './pages/TPO/Experiences';
import TPOProfile from './pages/TPO/Profile';

import CompanyDashboard from './pages/Company/Dashboard';
import CompanyDrivesList from './pages/Company/DrivesList';
import CompanyProfile from './pages/Company/Profile';
import CompanyApplicants from './pages/Company/Applicants';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
        <Route path="/student/drives" element={<ProtectedRoute allowedRoles={['student']}><StudentDrives /></ProtectedRoute>} />
        <Route path="/student/drives/:id" element={<ProtectedRoute allowedRoles={['student']}><DriveDetail /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><MyApplications /></ProtectedRoute>} />
        <Route path="/student/experiences" element={<ProtectedRoute allowedRoles={['student']}><Experiences /></ProtectedRoute>} />
        <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentSettings /></ProtectedRoute>} />

        {/* TPO Routes */}
        <Route path="/tpo/dashboard" element={<ProtectedRoute allowedRoles={['tpo']}><TPODashboard /></ProtectedRoute>} />
        <Route path="/tpo/profile" element={<ProtectedRoute allowedRoles={['tpo']}><TPOProfile /></ProtectedRoute>} />
        <Route path="/tpo/drives" element={<ProtectedRoute allowedRoles={['tpo']}><TPODrives /></ProtectedRoute>} />
        <Route path="/tpo/drives/create" element={<ProtectedRoute allowedRoles={['tpo']}><DriveCreate /></ProtectedRoute>} />
        <Route path="/tpo/drives/:id/shortlist" element={<ProtectedRoute allowedRoles={['tpo']}><TPOShortlist /></ProtectedRoute>} />
        <Route path="/tpo/students" element={<ProtectedRoute allowedRoles={['tpo']}><TPOStudents /></ProtectedRoute>} />
        <Route path="/tpo/experiences" element={<ProtectedRoute allowedRoles={['tpo']}><TPOExperiences /></ProtectedRoute>} />

        {/* Company Routes */}
        <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/profile" element={<ProtectedRoute allowedRoles={['company']}><CompanyProfile /></ProtectedRoute>} />
        <Route path="/company/drives" element={<ProtectedRoute allowedRoles={['company']}><CompanyDrivesList /></ProtectedRoute>} />
        <Route path="/company/drives/:id/applicants" element={<ProtectedRoute allowedRoles={['company']}><CompanyApplicants /></ProtectedRoute>} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
