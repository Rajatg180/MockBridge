import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { bootstrapSession, forceLogout } from '../../features/auth/authSlice';
import { fetchMyProfile } from '../../features/profile/profileSlice';
import { FullPageState } from '../ui/FullPageState';

export function AppBootstrap() {
  const dispatch = useAppDispatch();
  const { initialized, user, bootStatus } = useAppSelector((state) => state.auth);
  const { status, loadedForUserId } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (!initialized && bootStatus === 'idle') {
      dispatch(bootstrapSession());
    }
  }, [dispatch, initialized, bootStatus]);

  useEffect(() => {
    if (initialized && user && loadedForUserId !== user.userId && status !== 'loading') {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, initialized, user, loadedForUserId, status]);

  useEffect(() => {
    if (initialized && !user && bootStatus === 'failed') {
      dispatch(forceLogout());
    }
  }, [dispatch, initialized, user, bootStatus]);

  if (!initialized) {
    return <FullPageState title="Restoring your session" description="Checking saved tokens and profile state." />;
  }

  return <Outlet />;
}
