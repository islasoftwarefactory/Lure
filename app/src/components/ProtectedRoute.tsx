import { Navigate, Outlet } from 'react-router-dom';
import { useLock } from '../context/LockContext';

export function ProtectedRoute() {
  const { isUnlocked } = useLock();

  if (!isUnlocked) {
    return <Navigate to="/locked" replace />;
  }

  return <Outlet />;
}
