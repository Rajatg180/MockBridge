import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { FullPageState } from '../ui/FullPageState';

export function ProfileCompletionGuard() {
  const { status, onboardingRequired, profile, error } = useAppSelector((state) => state.profile);

  if (status === 'loading' || status === 'idle') {
    return <FullPageState title="Loading profile" description="Fetching your onboarding state." />;
  }

  if (onboardingRequired) {
    return <Navigate to="/profile/setup" replace />;
  }

  if (status === 'failed' && !profile) {
    return (
      <div className="full-page-state">
        <div className="card state-card">
          <h2>Could not load your profile</h2>
          <p className="muted">{error || 'Please refresh the page or sign in again.'}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <Outlet />;
}
