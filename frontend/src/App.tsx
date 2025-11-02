import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useTheme } from './hooks/useTheme';
import LandingPage from './pages/LandingPage';
import TeachingSession from './pages/TeachingSession';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SessionHistory from './pages/SessionHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';

function HomeRoute() {
  const { user } = useAuthStore();

  if (!user) {
    return <LandingPage />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard />;
}

function App() {
  const { restoreSession } = useAuthStore();
  useTheme(); // Initialize theme from localStorage

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Home - Landing or Dashboard based on auth */}
          <Route path="/" element={<HomeRoute />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Main Routes */}
          <Route path="/teach/:sessionId" element={<TeachingSession />} />
          <Route path="/history/:aiStudentId" element={<SessionHistory />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
