import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { decodeToken, getRedirectPathByRole } from '~/lib/auth-tokens';
import { loadUser } from '~/store/features/auth-slice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      dispatch(loadUser({ accessToken, isRemember: true }));
      toast.success('Đăng nhập thành công!');
    }
  }, [dispatch, searchParams]);

  const accessToken = searchParams.get('accessToken');
  const hasOnboarded =
    searchParams.get('hasOnboarded') === 'true' ||
    searchParams.get('hasOnboarded') === true;

  // Decode token get role
  const decodedToken = accessToken ? decodeToken(accessToken) : null;
  const role = decodedToken?.role;

  // Get redirect path based on role
  const redirectPath = getRedirectPathByRole(role, hasOnboarded);

  return <Navigate to={redirectPath} replace />;
};

export default AuthCallbackPage;
