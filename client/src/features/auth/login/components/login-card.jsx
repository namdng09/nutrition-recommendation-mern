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
    <Card className='w-full max-w-md rounded-2xl border-[#2E7D32]/15 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]'>
      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2E7D32]/20 bg-[#2E7D32]/5 shadow-sm'>
            <HiOutlineLockClosed className='h-6 w-6 text-[#1B5E20]' />
          </div>

          <div className='leading-[1.05]'>
            <CardTitle className='text-2xl font-bold text-[#1B5E20]'>
              Đăng nhập
            </CardTitle>
            <CardDescription className='text-[#2E7D32]/70'>
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
          <span className='text-[#1B5E20]/75'>
            Chưa có tài khoản?{' '}
            <Link
              to='/auth/sign-up'
              className='font-semibold text-[#1B5E20] hover:underline underline-offset-4'
            >
              Đăng ký
            </Link>
          </span>
          <span>
            <Link
              to='/auth/forgot-password'
              className='font-semibold text-[#1B5E20] hover:underline underline-offset-4'
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
