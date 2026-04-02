import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { startLogout } from '~/lib/api-client';
import { clearAuthTokens } from '~/lib/auth-tokens';
import { queryClient } from '~/lib/query-client';
import { logout, setLoggingOut } from '~/store/features/auth-slice';

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(() => {
    dispatch(setLoggingOut());
    startLogout();
    clearAuthTokens();
    queryClient.clear();
    dispatch(logout()).finally(() => {
      navigate('/');
    });
  }, [dispatch, navigate]);
};
