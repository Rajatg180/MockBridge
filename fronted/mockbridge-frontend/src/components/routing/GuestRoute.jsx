import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export function GuestRoute() {
  const { user } = useAppSelector((state) => state.auth);
  const { onboardingRequired } = useAppSelector((state) => state.profile);

  if (user) {
    return <Navigate to={onboardingRequired ? '/profile/setup' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
