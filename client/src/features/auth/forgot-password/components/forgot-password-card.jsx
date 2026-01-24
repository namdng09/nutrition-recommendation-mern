import { HiOutlineArrowLeft, HiOutlineMail } from 'react-icons/hi';
import { Link } from 'react-router';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

import { useForgotPassword } from '../api/forgot-password';
import ForgotPasswordForm from './forgot-password-form';

const ForgotPasswordCard = () => {
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: data => {
      toast.success(
        data.message ||
          'Đã gửi liên kết đặt lại mật khẩu! Vui lòng kiểm tra email.'
      );
    },
    onError: () => {
      toast.success(
        'Đã gửi liên kết đặt lại mật khẩu! Vui lòng kiểm tra email.'
      );
    }
  });

  const handleSubmit = data => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <Card className='w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background/85 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-1 w-full bg-gradient-to-r from-transparent via-border to-transparent' />

      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-accent'>
            <HiOutlineMail className='h-6 w-6 text-primary' />
          </div>

          <div className='flex flex-col'>
            <CardTitle className='text-2xl font-bold text-primary'>
              Quên mật khẩu
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground'>
              Nhập email để nhận liên kết đặt lại mật khẩu
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          isLoading={forgotPasswordMutation.isPending}
        />
      </CardContent>

      <CardFooter className='flex flex-col gap-3'>
        <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

        <p className='text-sm text-muted-foreground'>
          Nhớ mật khẩu rồi?{' '}
          <Link
            to='/auth/login'
            className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
          >
            <HiOutlineArrowLeft className='h-4 w-4' />
            Quay lại đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordCard;
