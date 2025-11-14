import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <>{children}</>;
  }

  if (user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/verify-email" replace />;
}
