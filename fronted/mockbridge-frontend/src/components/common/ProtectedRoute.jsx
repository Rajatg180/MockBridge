import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { accessToken, user, isBootstrapping } = useSelector((state) => state.auth);

  if (isBootstrapping) {
    return <Loader fullscreen label="Restoring your session..." />;
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children || <Outlet />;
}
