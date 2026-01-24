import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { HiOutlineMail } from 'react-icons/hi';

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
              <FormLabel className='text-muted-foreground'>Email</FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineMail className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Nhập email của bạn'
                    className='h-11 rounded-xl border-border pl-10 focus-visible:ring-ring'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
          disabled={isLoading}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
