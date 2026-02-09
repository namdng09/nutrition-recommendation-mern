import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle } from 'react-icons/fa';
import { HiOutlineEnvelope, HiOutlineKey } from 'react-icons/hi2';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { loginSchema } from '../schemas/login-schema';

const LoginForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      isRemember: false
    }
  });

  const handleSubmit = data => {
    const { isRemember, ...loginData } = data;
    onSubmit({ loginData, isRemember });
  };

  return (
    <div className='space-y-4'>
      <Button
        variant='outline'
        className='w-full rounded-xl border border-border bg-background/60 hover:bg-accent text-primary shadow-sm'
        onClick={() => {
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const authPath = '/api/auth/google';
          window.location.href = apiUrl.startsWith('http')
            ? `${apiUrl}${authPath}`
            : `${window.location.origin}${authPath}`;
        }}
      >
        <FaGoogle className='mr-2 h-4 w-4' />
        Tiếp tục đăng nhập với Google
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-3 text-muted-foreground'>
            Hoặc đăng nhập bằng email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>Email</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <HiOutlineEnvelope className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='Nhập email của bạn'
                      className='rounded-xl border-border pl-10 focus-visible:ring-ring/30'
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
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>Mật khẩu</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <HiOutlineKey className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      type='password'
                      placeholder='Nhập mật khẩu'
                      className='rounded-xl border-border pl-10 focus-visible:ring-ring/30'
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
            name='isRemember'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 pt-2'>
                <FormControl>
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    className='border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                  />
                </FormControl>
                <div className='space-y-2 leading-none'>
                  <FormLabel className='text-muted-foreground'>
                    Ghi nhớ đăng nhập
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
