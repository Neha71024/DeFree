import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/spinner';

/**
 * ProtectedRoute – only renders children when authenticated.
 * Unauthenticated users are redirected to the landing page (/).
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  if (isLoading) return <PageLoader message="Loading..." variant="faded" />;
  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;

  return <>{children}</>;
};

/**
 * PublicOnlyRoute – only renders children when NOT authenticated.
 * Authenticated users are redirected to /dashboard.
 */
export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthState();

  if (isLoading) return <PageLoader message="Loading..." variant="faded" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
