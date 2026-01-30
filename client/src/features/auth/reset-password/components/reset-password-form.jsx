import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { HiOutlineLockClosed } from 'react-icons/hi';

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

import { resetPasswordSchema } from '../schemas/reset-password-schema';

const ResetPasswordForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = data => {
    const { confirmPassword, ...resetData } = data;
    onSubmit(resetData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-muted-foreground'>
                Mật khẩu mới
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineLockClosed className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    type='password'
                    placeholder='Nhập mật khẩu mới'
                    className='h-11 rounded-xl border-border pl-10 focus-visible:ring-ring'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-muted-foreground'>
                Xác nhận mật khẩu mới
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineLockClosed className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    type='password'
                    placeholder='Nhập lại mật khẩu mới'
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
          {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
