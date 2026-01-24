import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle } from 'react-icons/fa';
import {
  HiOutlineCamera,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineUser
} from 'react-icons/hi2';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { GENDER_OPTIONS } from '~/constants/gender';
import { cn } from '~/lib/utils';

import { signUpSchema } from '../schemas/sign-up-schema';

const SignUpForm = ({ onSubmit, isLoading }) => {
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      email: '',
      name: '',
      gender: '',
      dob: '',
      password: '',
      confirmPassword: '',
      avatar: undefined
    }
  });

  const watchedAvatar = form.watch('avatar');

  const handleSubmit = data => {
    onSubmit(data);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-4'>
      <Button
        variant='outline'
        className='w-full rounded-xl border border-border bg-background/60 hover:bg-accent text-primary shadow-sm'
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
        }}
      >
        <FaGoogle className='mr-2 h-4 w-4' />
        Tiếp tục với Google
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-3 text-muted-foreground'>
            Hoặc đăng ký bằng email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='avatar'
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel className='text-primary'>Ảnh đại diện</FormLabel>
                <FormControl>
                  <div className='flex flex-col items-center space-y-2'>
                    <div
                      className='relative h-20 w-20 cursor-pointer transition-all duration-200 hover:opacity-80'
                      onClick={handleAvatarClick}
                    >
                      <Avatar className='h-full w-full border-2 border-border shadow-sm'>
                        <AvatarImage
                          src={
                            watchedAvatar && watchedAvatar[0]
                              ? URL.createObjectURL(watchedAvatar[0])
                              : undefined
                          }
                          alt='Avatar'
                        />
                        <AvatarFallback className='text-xs text-muted-foreground'>
                          {watchedAvatar && watchedAvatar[0]
                            ? 'IMG'
                            : 'Thêm ảnh'}
                        </AvatarFallback>
                      </Avatar>

                      <div className='absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm'>
                        <HiOutlineCamera className='h-4 w-4 text-primary' />
                      </div>
                    </div>

                    <Input
                      {...field}
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={e => {
                        onChange(e.target.files);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>
                  Họ và tên <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <HiOutlineUser className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='Nhập họ và tên'
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>
                  Email <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <HiOutlineEnvelope className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      placeholder='Nhập email'
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
                <FormLabel className='text-primary'>
                  Mật khẩu <span className='text-red-500'>*</span>
                </FormLabel>
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
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>
                  Nhập lại mật khẩu <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <HiOutlineIdentification className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                      type='password'
                      placeholder='Nhập lại mật khẩu'
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
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full rounded-xl border-border focus:ring-ring/30'>
                      <SelectValue placeholder='Chọn giới tính' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dob'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-primary'>Ngày sinh</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full rounded-xl border-border bg-background/60 pl-3 text-left font-normal text-primary hover:bg-accent',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-60' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      captionLayout='dropdown'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={date => {
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      disabled={date =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      defaultMonth={
                        field.value ? new Date(field.value) : new Date(2000, 0)
                      }
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            disabled={isLoading}
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
