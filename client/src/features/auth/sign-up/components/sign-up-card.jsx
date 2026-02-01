import React from 'react';
import { HiOutlineUserPlus } from 'react-icons/hi2';
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
import { buildFormData } from '~/lib/form-data';
import { loadUser } from '~/store/features/auth-slice';

import { useSignUp } from '../api/sign-up';
import SignUpForm from './sign-up-form';

const SignUpCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signUpMutation = useSignUp({
    onSuccess: data => {
      const { accessToken, hasOnboarded } = data.data;
      dispatch(loadUser({ accessToken }));
      navigate(hasOnboarded ? '/' : '/onboarding');
      toast.success(data.message || 'Tạo tài khoản thành công');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    }
  });

  const handleSubmit = data => {
    const formData = buildFormData(data, {
      exclude: ['confirmPassword'],
      fileFields: ['avatar']
    });

    signUpMutation.mutate(formData);
  };

  return (
    <Card className='w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]'>
      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent shadow-sm'>
            <HiOutlineUserPlus className='h-6 w-6 text-primary' />
          </div>

          <div className='leading-[1.05]'>
            <CardTitle className='text-2xl font-bold text-primary'>
              Đăng ký
            </CardTitle>
            <CardDescription className='text-muted-foreground'>
              Tạo tài khoản mới để bắt đầu
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-2'>
        <SignUpForm
          onSubmit={handleSubmit}
          isLoading={signUpMutation.isPending}
        />
      </CardContent>

      <CardFooter className='pt-6'>
        <p className='text-sm text-center w-full text-muted-foreground'>
          Đã có tài khoản?{' '}
          <Link
            to='/auth/login'
            className='font-semibold text-primary hover:underline underline-offset-4'
          >
            Đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpCard;
