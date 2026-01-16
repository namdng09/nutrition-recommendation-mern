import { useTheme } from 'next-themes';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';

import { Toaster } from '~/components/ui/sonner';
import { Spinner } from '~/components/ui/spinner';
import {
  initializeAuth,
  setupSessionExpiredListener
} from '~/store/features/auth-slice';

const AppLayout = () => {
  const { loading } = useSelector(state => state.auth);
  const { theme } = useTheme();
  const dispatch = useDispatch();

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

  return (
    <>
      <Outlet />
      <Toaster position='top-right' theme={theme} />
    </>
  );
};

export default AppLayout;
