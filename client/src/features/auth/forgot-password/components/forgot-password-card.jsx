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
    <Card className='w-full max-w-md overflow-hidden rounded-2xl border border-[#2E7D32]/15 bg-background/85 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-1 w-full bg-gradient-to-r from-transparent via-[#2E7D32]/45 to-transparent' />

      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-[#2E7D32]/20 bg-[#2E7D32]/5'>
            <HiOutlineMail className='h-6 w-6 text-[#1B5E20]' />
          </div>

          <div className='flex flex-col'>
            <CardTitle className='text-2xl font-bold text-[#1B5E20]'>
              Quên mật khẩu
            </CardTitle>
            <CardDescription className='text-sm text-[#2E7D32]/70'>
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
        <div className='h-px w-full bg-gradient-to-r from-transparent via-[#2E7D32]/20 to-transparent' />

        <p className='text-sm text-[#1B5E20]/75'>
          Nhớ mật khẩu rồi?{' '}
          <Link
            to='/auth/login'
            className='inline-flex items-center gap-1 font-medium text-[#1B5E20] hover:underline'
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
