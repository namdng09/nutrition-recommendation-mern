import React from 'react';
import { HiOutlineLockClosed } from 'react-icons/hi2';
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
import { ROLE } from '~/constants/role';
import { loadUser } from '~/store/features/auth-slice';

import { useLogin } from '../api/login';
import LoginForm from './login-form';

const decodeToken = token => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const LoginCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useLogin({
    onSuccess: (data, variables) => {
      const { accessToken, hasOnboarded } = data.data;

      const decodedToken = decodeToken(accessToken);
      const role = decodedToken?.role;

      dispatch(loadUser({ accessToken, isRemember: variables.isRemember }));

      if (role === ROLE.ADMIN) {
        navigate('/admin');
      } else if (role === ROLE.NUTRITIONIST) {
        navigate('/nutritionist');
      } else {
        navigate(hasOnboarded ? '/' : '/onboarding');
      }

      toast.success(data.message || 'Đăng nhập thành công');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    }
  });

  const handleSubmit = ({ loginData, isRemember }) => {
    loginMutation.mutate({ ...loginData, isRemember });
  };

  return (
    <Card className='w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]'>
      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent shadow-sm'>
            <HiOutlineLockClosed className='h-6 w-6 text-primary' />
          </div>

          <div className='leading-[1.05]'>
            <CardTitle className='text-2xl font-bold text-primary'>
              Đăng nhập
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Vui lòng đăng nhập để tiếp tục
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-2'>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={loginMutation.isPending}
        />
      </CardContent>

      <CardFooter className='pt-6'>
        <p className='text-sm flex flex-col gap-2'>
          <span className='text-muted-foreground'>
            Chưa có tài khoản?{' '}
            <Link
              to='/auth/sign-up'
              className='font-semibold text-primary hover:underline underline-offset-4'
            >
              Đăng ký
            </Link>
          </span>
          <span>
            <Link
              to='/auth/forgot-password'
              className='font-semibold text-primary hover:underline underline-offset-4'
            >
              Quên mật khẩu?
            </Link>
          </span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
