import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

// Auth Pages
import { Login } from './pages/auth/Login.jsx';
import { Register } from './pages/auth/Register.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { StaffManagement } from './pages/admin/StaffManagement.jsx';
import { ServicesConfig } from './pages/admin/ServicesConfig.jsx';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.jsx';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.jsx';
import { DoctorQueue } from './pages/doctor/DoctorQueue.jsx';
import { DoctorPatients } from './pages/doctor/DoctorPatients.jsx';
import { ClinicalEncounterConsole } from './pages/doctor/ClinicalEncounterConsole.jsx';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard.jsx';
import { PatientRegistration } from './pages/receptionist/PatientRegistration.jsx';
import { AppointmentBooking } from './pages/receptionist/AppointmentBooking.jsx';
import { BillingManagement } from './pages/receptionist/BillingManagement.jsx';

// Lab Pages
import { LabWorkQueue } from './pages/lab/LabWorkQueue.jsx';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard.jsx';
import { PatientAppointments } from './pages/patient/PatientAppointments.jsx';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions.jsx';
import { PatientLabReports } from './pages/patient/PatientLabReports.jsx';
import { PatientInvoices } from './pages/patient/PatientInvoices.jsx';

// Role Home Director
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const homeMap = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    receptionist: '/receptionist/dashboard',
    lab_technician: '/lab/queue',
    patient: '/patient/dashboard',
  };

  return <Navigate to={homeMap[user?.role] || '/login'} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomeRedirect />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StaffManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ServicesConfig />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/queue"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorPatients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/encounter/:appointmentId"
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <ClinicalEncounterConsole />
                  </ProtectedRoute>
                }
              />

              {/* Receptionist Routes */}
              <Route
                path="/receptionist/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                    <ReceptionistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist/booking"
                element={
                  <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                    <AppointmentBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist/patients/new"
                element={
                  <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                    <PatientRegistration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receptionist/billing"
                element={
                  <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                    <BillingManagement />
                  </ProtectedRoute>
                }
              />

              {/* Lab Technician Routes */}
              <Route
                path="/lab/queue"
                element={
                  <ProtectedRoute allowedRoles={['lab_technician', 'doctor', 'admin']}>
                    <LabWorkQueue />
                  </ProtectedRoute>
                }
              />

              {/* Patient Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientPrescriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/lab-reports"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientLabReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/invoices"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientInvoices />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
