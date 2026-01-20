import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { loadUser } from '~/store/features/auth-slice';

import { useLogin } from '../api/login';
import LoginForm from './login-form';

const LoginCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useLogin({
    onSuccess: (data, variables) => {
      const { accessToken } = data.data;
      dispatch(loadUser({ accessToken, isRemember: variables.isRemember }));
      navigate('/');
      toast.success(data.message || 'Login successful');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  });

  const handleSubmit = ({ loginData, isRemember }) => {
    loginMutation.mutate({ ...loginData, isRemember });
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Please login to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={loginMutation.isPending}
        />
      </CardContent>

      <CardFooter className='pt-6'>
        <p className='text-sm text-muted-foreground flex flex-col gap-2'>
          <span>
            Don't have an account?{' '}
            <Link to='/auth/sign-up' className='text-primary hover:underline'>
              Sign up
            </Link>
          </span>
          <span>
            <Link
              to='/auth/forgot-password'
              className='text-primary hover:underline'
            >
              Forgot password?
            </Link>
          </span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
