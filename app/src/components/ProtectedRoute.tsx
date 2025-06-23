import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useLock } from '../context/LockContext';

export function ProtectedRoute() {
  const { isUnlocked } = useLock();
  const location = useLocation();

  if (!isUnlocked) {
    // Enhanced security: clear browser history to prevent back-button bypass
    window.history.replaceState(null, '', '/locked');
    return <Navigate to="/locked" replace />;
  }

  return <Outlet />;
}
