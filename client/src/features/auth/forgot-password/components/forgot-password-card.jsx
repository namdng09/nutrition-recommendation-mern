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
        data.message || 'Password reset link sent! Please check your email.'
      );
    },
    onError: () => {
      // Show success message even on error to prevent email enumeration
      toast.success('Password reset link sent! Please check your email.');
    }
  });

  const handleSubmit = data => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          isLoading={forgotPasswordMutation.isPending}
        />
      </CardContent>

      <CardFooter>
        <p className='text-sm text-muted-foreground'>
          Remember your password?{' '}
          <Link to='/auth/login' className='text-primary hover:underline'>
            Back to login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordCard;
