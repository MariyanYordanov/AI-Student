import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
}

/**
 * ProtectedRoute component ensures user is authenticated
 * Optionally requires email to be verified
 */
export function ProtectedRoute({
  children,
  requireEmailVerified = false
}: ProtectedRouteProps) {
  const { user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Email not verified and it's required
  if (requireEmailVerified && !user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
