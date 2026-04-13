import { yupResolver } from '@hookform/resolvers/yup';
import { Camera, LogOut, Save, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'sonner';

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
import { Separator } from '~/components/ui/separator';
import { Spinner } from '~/components/ui/spinner';
import { Textarea } from '~/components/ui/textarea';
import { ROLE } from '~/constants/role';
import { useUpdateNutritionistProfile } from '~/features/users/update-nutritionist-profile/api/update-nutritionist-profile';
import { nutritionistProfileSchema } from '~/features/users/update-nutritionist-profile/schemas/nutritionist-profile-schema';
import { useUpdateProfile } from '~/features/users/update-profile/api/update-profile';
import { updateProfileSchema } from '~/features/users/update-profile/schemas/update-profile-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { useLogout } from '~/hooks/useLogout';

const Profile = () => {
  const handleLogout = useLogout();
  const fileInputRef = useRef(null);
  const user = useSelector(state => state.auth.user);

  const { data: profile } = useProfileForPage();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: response => {
      toast.success(response?.message || 'Cập nhật hồ sơ thành công');
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  });

  const {
    mutate: updateNutritionistProfile,
    isPending: isUpdatingNutritionist
  } = useUpdateNutritionistProfile();

  const [avatarPreview, setAvatarPreview] = useState(null);

  const formatTokenValue = value => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return '--';
    }

    return Math.max(0, Math.round(numericValue)).toLocaleString('vi-VN');
  };

  const formatQuotaResetAt = value => {
    if (!value) {
      return null;
    }

    const resetDate = new Date(value);
    if (Number.isNaN(resetDate.getTime())) {
      return null;
    }

    return resetDate.toLocaleString('vi-VN');
  };

  const membershipLevel = profile?.membershipLevel || 'Chưa cập nhật';
  const remainingAiTokens = formatTokenValue(profile?.aiTokens);
  const dailyAiTokenLimit = formatTokenValue(profile?.aiDailyTokenLimit);
  const quotaResetAtText = formatQuotaResetAt(profile?.aiQuotaResetAt);
  const mealSettings = profile?.mealSettings || [];

  const form = useForm({
    resolver: yupResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name || '',
          avatar: undefined
        }
      : undefined
  });

  const nutritionistForm = useForm({
    resolver: yupResolver(nutritionistProfileSchema),
    values: profile?.nutritionistProfile
      ? {
          workplace: profile.nutritionistProfile.workplace || '',
          graduatedUniversity:
            profile.nutritionistProfile.graduatedUniversity || '',
          professionalBio: profile.nutritionistProfile.professionalBio || ''
        }
      : {
          workplace: '',
          graduatedUniversity: '',
          professionalBio: ''
        }
  });

  const handleSave = data => {
    updateProfile(data);
  };

  const handleSaveNutritionistProfile = data => {
    updateNutritionistProfile(data, {
      onSuccess: () => {
        toast.success('Hồ sơ dinh dưỡng được cập nhật thành công');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Cập nhật hồ sơ dinh dưỡng thất bại'
        );
      }
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      updateProfile({ avatar: file });
    }
  };

  const handleSaveAll = async e => {
    e.preventDefault();

    if (profile?.role === ROLE.NUTRITIONIST) {
      const nutritionistFormValid = await nutritionistForm.trigger();
      if (!nutritionistFormValid) return;
      nutritionistForm.handleSubmit(handleSaveNutritionistProfile)();
    }

    const userFormValid = await form.trigger();
    if (!userFormValid) return;
    form.handleSubmit(handleSave)();
  };

  if (!user) {
    return null;
  }

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <User className='h-5 w-5 text-primary' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Hồ sơ cá nhân
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              {/* Form Content */}
              <div className='space-y-0'>
                {/* Profile Section */}
                <div className='p-6 space-y-6'>
                  <div className='space-y-1'>
                    <h3 className='text-base font-semibold'>
                      Thông tin tài khoản
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Cập nhật ảnh đại diện và tên hiển thị của bạn
                    </p>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8'>
                    {/* Left Column - Avatar */}
                    <div className='flex lg:items-center lg:justify-center'>
                      <div className='relative'>
                        <div
                          className='relative cursor-pointer group'
                          onClick={handleAvatarClick}
                        >
                          <Avatar className='h-40 w-40 ring-4 ring-primary/10 transition-all group-hover:ring-primary/20'>
                            <AvatarImage
                              src={avatarPreview || profile?.avatar}
                              alt={profile?.name}
                              className='object-cover'
                            />
                            <AvatarFallback className='text-5xl font-semibold bg-primary/5 text-primary'>
                              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          <div className='absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-lg transition-all group-hover:bg-accent group-hover:scale-110'>
                            <Camera className='h-5 w-5 text-primary' />
                          </div>
                        </div>

                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={handleAvatarChange}
                        />

                        {/* {isUpdating && (
                          <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full'>
                            <Spinner className='h-8 w-8' />
                          </div>
                        )} */}

                        <p className='mt-4 text-center text-xs text-muted-foreground'>
                          Click để thay đổi ảnh đại diện
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className='space-y-5 min-w-0'>
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                            <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                              Họ và tên{' '}
                              <span className='text-destructive'>*</span>
                            </FormLabel>
                            <div className='space-y-2'>
                              <FormControl>
                                <Input
                                  placeholder='Nhập họ và tên'
                                  className='rounded-xl border-border focus-visible:ring-primary'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Email - Read Only */}
                      <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                        <label className='text-sm font-medium pt-2 sm:pt-0'>
                          Email
                        </label>
                        <div className='space-y-2'>
                          <div className='flex h-10 w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm'>
                            {profile?.email}
                          </div>
                        </div>
                      </div>

                      {/* Role - Read Only */}
                      <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                        <label className='text-sm font-medium pt-2 sm:pt-0'>
                          Vai trò
                        </label>
                        <div className='space-y-2'>
                          <div className='inline-flex h-10 items-center rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-medium text-primary'>
                            {profile?.role}
                          </div>
                        </div>
                      </div>

                      {/* Membership Level - Read Only */}
                      <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                        <label className='text-sm font-medium pt-2 sm:pt-0'>
                          Gói thành viên
                        </label>
                        <div className='space-y-2'>
                          <div className='inline-flex h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700'>
                            {membershipLevel}
                          </div>
                        </div>
                      </div>

                      {/* AI Tokens - Read Only */}
                      <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                        <label className='text-sm font-medium pt-2 sm:pt-0'>
                          Token AI
                        </label>
                        <div className='space-y-2'>
                          <div className='inline-flex h-10 items-center rounded-xl border border-border bg-muted px-4 text-sm font-medium'>
                            {dailyAiTokenLimit === '--'
                              ? remainingAiTokens
                              : `${remainingAiTokens} / ${dailyAiTokenLimit}`}
                          </div>
                          {/* <p className='text-xs text-muted-foreground'>
                            {quotaResetAtText
                              ? `Quota sẽ đặt lại vào: ${quotaResetAtText}`
                              : 'Số token AI còn lại trong ngày'}
                          </p> */}
                        </div>
                      </div>

                      {/* Schedule Settings */}
                      <div className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start'>
                        <label className='text-sm font-medium pt-2'>
                          Lịch ăn
                        </label>
                        <div className='space-y-3'>
                          {mealSettings.length > 0 ? (
                            <div className='flex flex-wrap gap-2'>
                              {mealSettings.map(setting => (
                                <span
                                  key={setting.name}
                                  className='inline-flex h-8 items-center rounded-full border border-primary/20 bg-primary/5 px-3 text-xs font-semibold text-primary'
                                >
                                  {setting.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              Bạn chưa thiết lập lịch ăn.
                            </p>
                          )}

                          <Button variant='outline' size='sm' asChild>
                            <Link to='/profile/schedule-settings'>
                              Xem và cập nhật lịch ăn
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Nutritionist Profile Section */}
                {profile?.role === ROLE.NUTRITIONIST && (
                  <div className='p-6 space-y-6'>
                    <div className='space-y-1'>
                      <h3 className='text-base font-semibold'>
                        Hồ sơ chuyên gia dinh dưỡng
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Thông tin nghề nghiệp và chuyên môn của bạn
                      </p>
                    </div>

                    <Form {...nutritionistForm}>
                      <form
                        onSubmit={nutritionistForm.handleSubmit(
                          handleSaveNutritionistProfile
                        )}
                      >
                        <div className='space-y-5'>
                          <FormField
                            control={nutritionistForm.control}
                            name='workplace'
                            render={({ field }) => (
                              <FormItem className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                                <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                                  Nơi làm việc{' '}
                                  <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='space-y-2'>
                                  <FormControl>
                                    <Input
                                      placeholder='Nhập nơi làm việc'
                                      className='rounded-xl border-border focus-visible:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={nutritionistForm.control}
                            name='graduatedUniversity'
                            render={({ field }) => (
                              <FormItem className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start sm:items-center'>
                                <FormLabel className='text-sm font-medium pt-2 sm:pt-0'>
                                  Trường đại học{' '}
                                  <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='space-y-2'>
                                  <FormControl>
                                    <Input
                                      placeholder='Nhập trường đại học'
                                      className='rounded-xl border-border focus-visible:ring-primary'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={nutritionistForm.control}
                            name='professionalBio'
                            render={({ field }) => (
                              <FormItem className='grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 items-start'>
                                <FormLabel className='text-sm font-medium pt-2'>
                                  Tiểu sử
                                </FormLabel>
                                <div className='space-y-2'>
                                  <FormControl>
                                    <Textarea
                                      placeholder='Mô tả ngắn về chuyên môn và kinh nghiệm của bạn'
                                      className='rounded-xl border-border focus-visible:ring-primary resize-none'
                                      rows={4}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                  <p className='text-xs text-muted-foreground'>
                                    Tối đa 500 ký tự
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className='flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4'>
                <div className='flex items-center'>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={handleLogout}
                    className='min-w-[140px] rounded-xl flex items-center justify-center'
                  >
                    <LogOut className='h-4 w-4 mr-2' />
                    Đăng xuất
                  </Button>
                </div>

                <Button
                  type='button'
                  disabled={isUpdating || isUpdatingNutritionist}
                  size='default'
                  className='min-w-[140px]'
                  onClick={handleSaveAll}
                >
                  {isUpdating || isUpdatingNutritionist ? (
                    <>
                      <Spinner className='h-4 w-4 mr-2' />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
