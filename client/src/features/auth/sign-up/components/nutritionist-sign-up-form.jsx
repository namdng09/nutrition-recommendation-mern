import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft } from 'lucide-react';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice,
  HiOutlineCamera,
  HiOutlineDocument,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineUser
} from 'react-icons/hi2';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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

import { nutritionistSignUpSchema } from '../schemas/sign-up-schema';

const NutritionistSignUpForm = ({ onSubmit, onBack, isLoading }) => {
  const avatarInputRef = useRef(null);
  const certInputRef = useRef(null);

  const form = useForm({
    resolver: yupResolver(nutritionistSignUpSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      avatar: undefined,
      certificateName: '',
      certificate: undefined,
      workplace: '',
      graduatedUniversity: '',
      professionalBio: ''
    }
  });

  const watchedAvatar = form.watch('avatar');
  const watchedCert = form.watch('certificate');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <Button
          type='button'
          variant='outline'
          className='gap-2 w-full justify-start'
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className='h-5 w-5' />
          Quay lại
        </Button>
        {/* Avatar */}
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
                    onClick={() => avatarInputRef.current?.click()}
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
                        {watchedAvatar && watchedAvatar[0] ? 'IMG' : 'Thêm ảnh'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm'>
                      <HiOutlineCamera className='h-4 w-4 text-primary' />
                    </div>
                  </div>
                  <Input
                    {...field}
                    ref={avatarInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={e => onChange(e.target.files)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Họ và tên <span className='text-destructive'>*</span>
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

        {/* Email */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Email <span className='text-destructive'>*</span>
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

        {/* Password */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Mật khẩu <span className='text-destructive'>*</span>
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

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Nhập lại mật khẩu <span className='text-destructive'>*</span>
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

        {/* Certificate Name */}
        <FormField
          control={form.control}
          name='certificateName'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Tên chứng chỉ <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineDocument className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Ví dụ: Chứng chỉ Dinh dưỡng Lâm sàng'
                    className='rounded-xl border-border pl-10 focus-visible:ring-ring/30'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Certificate File */}
        <FormField
          control={form.control}
          name='certificate'
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Tệp chứng chỉ <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <div
                  className='flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/60 p-4 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5'
                  onClick={() => certInputRef.current?.click()}
                >
                  <HiOutlineDocument className='h-8 w-8 text-muted-foreground' />
                  {watchedCert && watchedCert[0] ? (
                    <p className='text-sm text-primary font-medium text-center break-all'>
                      {watchedCert[0].name}
                    </p>
                  ) : (
                    <p className='text-sm text-muted-foreground text-center'>
                      Nhấp để chọn tệp (hình ảnh hoặc PDF, tối đa 10MB)
                    </p>
                  )}
                  <Input
                    {...field}
                    ref={certInputRef}
                    type='file'
                    accept='image/*,application/pdf'
                    className='hidden'
                    onChange={e => onChange(e.target.files)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Workplace */}
        <FormField
          control={form.control}
          name='workplace'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Nơi làm việc <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineBuildingOffice className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Ví dụ: Bệnh viện Chợ Rẫy'
                    className='rounded-xl border-border pl-10 focus-visible:ring-ring/30'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Graduated University */}
        <FormField
          control={form.control}
          name='graduatedUniversity'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>
                Trường đại học <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <HiOutlineAcademicCap className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Ví dụ: Đại học Y Dược TP.HCM'
                    className='rounded-xl border-border pl-10 focus-visible:ring-ring/30'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Professional Bio */}
        <FormField
          control={form.control}
          name='professionalBio'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-primary'>Mô tả chuyên môn</FormLabel>
              <FormControl>
                <textarea
                  placeholder='Mô tả ngắn về chuyên môn và kinh nghiệm của bạn'
                  className='flex min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:ring-ring/30 focus-visible:outline-none resize-none'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className='text-xs text-muted-foreground'>Tối đa 500 ký tự</p>
            </FormItem>
          )}
        />

        <div className='pt-1'>
          <Button
            type='submit'
            className='w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            disabled={isLoading}
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NutritionistSignUpForm;
