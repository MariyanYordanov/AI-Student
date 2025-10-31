import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import TeachingSession from './pages/TeachingSession';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import SessionHistory from './pages/SessionHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { restoreSession } = useAuthStore();

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Main Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/teach/:sessionId" element={<TeachingSession />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/history/:aiStudentId" element={<SessionHistory />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
