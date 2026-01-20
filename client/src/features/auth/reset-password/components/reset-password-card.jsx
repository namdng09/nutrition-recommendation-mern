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
      toast.success(data.message || 'Password has been reset successfully!');
      navigate('/auth/login');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message ||
          'Password reset failed. Please try again.'
      );
    }
  });

  const handleSubmit = data => {
    resetPasswordMutation.mutate({ token, ...data });
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter new password to reset your password
        </CardDescription>
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
