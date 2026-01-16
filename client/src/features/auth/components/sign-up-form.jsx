import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle } from 'react-icons/fa';

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

import { signUpSchema } from '../schemas/auth-schemas';

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
        className='w-full'
        onClick={() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
        }}
      >
        <FaGoogle className='mr-2' />
        Continue with Google
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with email
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
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className='flex flex-col items-center space-y-2'>
                    <div
                      className='w-20 h-20 cursor-pointer transition-all duration-200 hover:opacity-60'
                      onClick={handleAvatarClick}
                    >
                      <Avatar className='w-full h-full border-2 border-gray-300'>
                        <AvatarImage
                          src={
                            watchedAvatar && watchedAvatar[0]
                              ? URL.createObjectURL(watchedAvatar[0])
                              : undefined
                          }
                          alt='Avatar'
                        />
                        <AvatarFallback className='text-xs'>
                          {watchedAvatar && watchedAvatar[0]
                            ? 'IMG'
                            : 'Add Avatar'}
                        </AvatarFallback>
                      </Avatar>
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
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter your full name' {...field} />
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
                <FormLabel>
                  Email <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter your email' {...field} />
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
                <FormLabel>
                  Password <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
                    {...field}
                  />
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
                <FormLabel>
                  Confirm Password <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Confirm your password'
                    {...field}
                  />
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
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select gender' />
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
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
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

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
