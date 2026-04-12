import React from 'react';

import LoginCard from '~/features/auth/login/components/login-card';
import useOAuthErrorToast from '~/hooks/useOAuthErrorToast';

const Login = () => {
  useOAuthErrorToast();

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <LoginCard />
    </div>
  );
};

export default Login;
