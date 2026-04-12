import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import CERTIFICATE_STATUS from '~/constants/certificate-status';
import { ROLE } from '~/constants/role';
import apiClient from '~/lib/api-client';
import { decodeToken } from '~/lib/auth-tokens';
import { loadUser } from '~/store/features/auth-slice';

const getOAuthSuccessKey = accessToken => `oauth_success_toast:${accessToken}`;

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      const successKey = getOAuthSuccessKey(accessToken);
      const hasShownSuccess = sessionStorage.getItem(successKey);

      dispatch(loadUser({ accessToken, isRemember: true }));

      if (!hasShownSuccess) {
        toast.success('Đăng nhập thành công!');
        sessionStorage.setItem(successKey, '1');
      }
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    const determineRedirect = async () => {
      const accessToken = searchParams.get('accessToken');
      const hasOnboarded =
        searchParams.get('hasOnboarded') === 'true' ||
        searchParams.get('hasOnboarded') === true;

      // Decode token to get role
      const decodedToken = accessToken ? decodeToken(accessToken) : null;
      const role = decodedToken?.role;

      if (role === ROLE.ADMIN) {
        setRedirectPath('/admin');
      } else if (role === ROLE.NUTRITIONIST) {
        // Fetch profile to check certificate status
        try {
          const response = await apiClient.get('/api/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          const profile = response.data.data;

          if (profile?.certificate?.status === CERTIFICATE_STATUS.APPROVED) {
            setRedirectPath('/nutritionist');
          } else {
            setRedirectPath('/profile/certificate');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setRedirectPath('/profile/certificate');
        }
      } else {
        setRedirectPath(hasOnboarded ? '/' : '/onboarding');
      }
    };

    determineRedirect();
  }, [searchParams]);

  if (redirectPath === null) {
    return null; // Loading state
  }

  return <Navigate to={redirectPath} replace />;
};

export default AuthCallbackPage;
