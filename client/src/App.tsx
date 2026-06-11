import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { CounsellorDashboard } from './pages/dashboard/CounsellorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AssessmentPage } from './pages/assessment/AssessmentPage';
import { MoodTrackerPage } from './pages/mood/MoodTrackerPage';
import { ChatPage } from './pages/chat/ChatPage';
import { ForumsPage } from './pages/forums/ForumsPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { ResourcesPage } from './pages/resources/ResourcesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AlertsPage } from './pages/alerts/AlertsPage';
import { SchedulePage } from './pages/appointments/SchedulePage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AssessmentsReviewPage } from './pages/assessment/AssessmentsReviewPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { useAuthStore } from './store/authStore';
import { useNotificationSocket } from './hooks/useNotificationSocket';

const DashboardRouter = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'counsellor') return <CounsellorDashboard />;
  return <StudentDashboard />;
};

function App() {
  // Initialize notification socket connection
  useNotificationSocket();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assessment" element={<ProtectedRoute roles={['student']}><AssessmentPage /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute roles={['student']}><MoodTrackerPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute roles={['student']}><ChatPage /></ProtectedRoute>} />
        <Route path="/forums" element={<ForumsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/counsellor/appointments" element={<Navigate to="/appointments" replace />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/alerts" element={<ProtectedRoute roles={['counsellor', 'admin']}><AlertsPage /></ProtectedRoute>} />
        <Route path="/counsellor/alerts" element={<Navigate to="/alerts" replace />} />
        <Route path="/schedule" element={<ProtectedRoute roles={['counsellor']}><SchedulePage /></ProtectedRoute>} />
        <Route path="/assessments-review" element={<ProtectedRoute roles={['counsellor', 'admin']}><AssessmentsReviewPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute roles={['admin']}><AdminResourcesPage /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute roles={['admin']}><AdminLogsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
