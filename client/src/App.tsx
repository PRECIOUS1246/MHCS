import { useEffect } from 'react';
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
import { GamePage } from './pages/game/GamePage';
import { useAuthStore } from './store/authStore';
import { useNotificationSocket } from './hooks/useNotificationSocket';

let clickAudioContext: AudioContext | null = null;

const playClickSound = () => {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return;

  if (!clickAudioContext) {
    clickAudioContext = new AudioContextClass();
  }

  if (clickAudioContext.state === 'suspended') {
    void clickAudioContext.resume();
  }

  const context = clickAudioContext;

  const createTone = (frequency: number, start: number, duration: number, volume: number) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + duration);
  };

  const start = context.currentTime;
  createTone(720, start, 0.18, 0.018);
  createTone(910, start + 0.04, 0.22, 0.014);
};

const DashboardRouter = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'counsellor') return <CounsellorDashboard />;
  return <StudentDashboard />;
};

function App() {
  // Initialize notification socket connection
  useNotificationSocket();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest('button, a, input, textarea, select')) {
        playClickSound();
      }
    };

    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route path="/register" element={<Navigate to="/student/register" replace />} />
      <Route path="/student/login" element={<LoginPage />} />
      <Route path="/student/register" element={<RegisterPage />} />
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
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game" element={<ProtectedRoute roles={['student']}><GamePage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute roles={['student']}><AssessmentPage /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute roles={['student']}><MoodTrackerPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute roles={['student']}><ChatPage /></ProtectedRoute>} />
        <Route path="/forums" element={<ForumsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/counsellor/appointments" element={<Navigate to="/appointments" replace />} />
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
