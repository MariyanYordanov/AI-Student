import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { useTheme } from './hooks/useTheme';
import { wakeUpBackend } from './services/api';
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
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { GuestRoute } from './components/GuestRoute';
import { LayoutProvider } from './contexts/LayoutContext';

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
  const [isInitialized, setIsInitialized] = useState(false);
  useTheme(); // Initialize theme from localStorage

  // Restore session and wake up backend on mount
  useEffect(() => {
    // Wake up backend early (don't await - let it run in background)
    wakeUpBackend();

    restoreSession();
    // Mark as initialized immediately (restoreSession is synchronous)
    setIsInitialized(true);
  }, []);

  // Don't render routes until session is restored from localStorage
  if (!isInitialized) {
    return <div />;
  }

  return (
    <ErrorBoundary>
      <LayoutProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 w-full">
              <Routes>
                {/* Auth Routes - Guest Only (unauthenticated users) */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <GuestRoute>
                      <VerifyEmail />
                    </GuestRoute>
                  }
                />

                {/* Home - Landing or Dashboard based on auth */}
                <Route path="/" element={<HomeRoute />} />

                {/* Admin Routes - Requires admin role */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Protected Routes - Requires authentication and email verification */}
                <Route
                  path="/teach/:sessionId"
                  element={
                    <ProtectedRoute requireEmailVerified>
                      <TeachingSession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history/:aiStudentId"
                  element={
                    <ProtectedRoute requireEmailVerified>
                      <SessionHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </LayoutProvider>
    </ErrorBoundary>
  );
}

export default App;
