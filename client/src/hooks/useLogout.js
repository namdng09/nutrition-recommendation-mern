import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import { startLogout } from '~/lib/api-client';
import { clearAuthTokens } from '~/lib/auth-tokens';
import { logout } from '~/store/features/auth-slice';

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async () => {
    startLogout();
    clearAuthTokens();
    dispatch(logout()).catch(() => {});
    navigate('/');
  };
};
