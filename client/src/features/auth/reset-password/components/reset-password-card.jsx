import { HiOutlineKey } from 'react-icons/hi';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

import { useResetPassword } from '../api/reset-password';
import ResetPasswordForm from './reset-password-form';

const ResetPasswordCard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const resetPasswordMutation = useResetPassword({
    onSuccess: data => {
      toast.success(data.message || 'Đặt lại mật khẩu thành công!');
      navigate('/auth/login');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message ||
          'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      );
    }
  });

  const handleSubmit = data => {
    resetPasswordMutation.mutate({ token, ...data });
  };

  return (
    <Card className='w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background/85 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-1 w-full bg-gradient-to-r from-transparent via-primary/45 to-transparent' />

      <CardHeader className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-accent'>
            <HiOutlineKey className='h-6 w-6 text-primary' />
          </div>

          <div className='flex flex-col'>
            <CardTitle className='text-2xl font-bold text-primary'>
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground'>
              Nhập mật khẩu mới để đặt lại mật khẩu của bạn
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResetPasswordForm
          onSubmit={handleSubmit}
          isLoading={resetPasswordMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default ResetPasswordCard;
