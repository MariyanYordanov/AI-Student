import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute component ensures user is authenticated and has admin privileges
 * Requires user to have ADMIN or SUPERADMIN role
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin - redirect to home
  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }

  // Email not verified - redirect to login
  if (!user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
