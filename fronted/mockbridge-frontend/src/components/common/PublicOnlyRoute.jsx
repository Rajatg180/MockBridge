import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Loader from './Loader';

export default function PublicOnlyRoute({ children }) {
  const { accessToken, user, isBootstrapping } = useSelector((state) => state.auth);

  if (isBootstrapping) {
    return <Loader fullscreen label="Checking your session..." />;
  }

  if (accessToken && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
