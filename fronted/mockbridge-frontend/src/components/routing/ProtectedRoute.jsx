import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { FullPageState } from '../ui/FullPageState';

export function ProtectedRoute() {
  const location = useLocation();
  const { initialized, user } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return <FullPageState title="Loading" description="Preparing your workspace." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
