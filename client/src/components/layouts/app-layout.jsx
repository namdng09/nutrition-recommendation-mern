import { useTheme } from 'next-themes';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

import { Toaster } from '~/components/ui/sonner';
import { Spinner } from '~/components/ui/spinner';
import { ROLE } from '~/constants/role';
import useAchievementSse from '~/hooks/useAchievementSse';
import { getStoredAccessToken } from '~/lib/auth-tokens';
import {
  initializeAuth,
  setupSessionExpiredListener
} from '~/store/features/auth-slice';

const AppLayout = () => {
  const { user, loading } = useSelector(state => state.auth);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();

  const accessToken = getStoredAccessToken();
  useAchievementSse(accessToken, !loading && !!user);

  useEffect(() => {
    dispatch(initializeAuth());
    const cleanup = setupSessionExpiredListener(dispatch);
    return cleanup;
  }, [dispatch]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (
    user &&
    !user.hasOnboarded &&
    location.pathname !== '/onboarding' &&
    user.role !== ROLE.ADMIN &&
    user.role !== ROLE.NUTRITIONIST
  ) {
    return <Navigate to='/onboarding' replace />;
  }

  if (user && user.hasOnboarded && location.pathname === '/onboarding') {
    return <Navigate to='/' replace />;
  }

  return (
    <>
      <Outlet />
      <Toaster position='top-right' theme={theme} />
    </>
  );
};

export default AppLayout;
