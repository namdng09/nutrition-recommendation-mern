import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { loadUser } from '~/store/features/auth-slice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const params = useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    dispatch(loadUser({ accessToken, isRemember: true }));
    toast.success('Login successful!');
  }, []);

  const hasOnboarded =
    searchParams.get('hasOnboarded') === 'true' ||
    searchParams.get('hasOnboarded') === true;

  return <Navigate to={hasOnboarded ? '/' : '/onboarding'} />;
};

export default AuthCallbackPage;
