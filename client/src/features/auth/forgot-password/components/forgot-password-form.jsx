import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { forgotPasswordSchema } from '../schemas/forgot-password-schema';

const ForgotPasswordForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
