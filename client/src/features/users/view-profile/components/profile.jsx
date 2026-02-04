import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Camera, LogOut, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

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
import { Spinner } from '~/components/ui/spinner';
import { GENDER_OPTIONS } from '~/constants/gender';
import { useUpdateProfile } from '~/features/users/update-profile/api/update-profile';
import { updateProfileSchema } from '~/features/users/update-profile/schemas/update-profile-schema';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';
import { logout } from '~/store/features/auth-slice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: profile } = useProfileForPage();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: response => {
      toast.success(response?.message || 'Cập nhật hồ sơ thành công');
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const form = useForm({
    resolver: yupResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name || '',
          avatar: undefined
        }
      : undefined
  });

  const handleSave = data => {
    updateProfile(data);
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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-4 flex items-center gap-2'>
        <HiOutlineUserCircle className='h-7 w-7' />
        <h1 className='text-2xl font-bold'>Hồ sơ cá nhân</h1>
      </div>

      <div className='flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <div
              className='relative cursor-pointer group'
              onClick={handleAvatarClick}
            >
              <Avatar className='h-20 w-20 ring-1 ring-border'>
                <AvatarImage
                  src={avatarPreview || profile?.avatar}
                  alt={profile?.name}
                />
                <AvatarFallback>
                  <img
                    src='/default-avatar.jpg'
                    alt='Default avatar'
                    className='h-full w-full object-cover'
                  />
                </AvatarFallback>
              </Avatar>

              <div className='absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm transition group-hover:bg-accent'>
                <Camera className='h-4 w-4' />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleAvatarChange}
            />

            {isUpdating && (
              <div className='absolute inset-0 flex items-center justify-center bg-background backdrop-blur-sm rounded-full'>
                <Spinner />
              </div>
            )}
          </div>

          <div className='min-w-0'>
            <h2 className='truncate text-xl font-bold'>{profile?.name}</h2>
            <p className='truncate text-sm text-muted-foreground'>
              {profile?.email}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
            className='rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
          >
            {isUpdating ? (
              <Spinner className='h-4 w-4 mr-1' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            Lưu
          </Button>

          <Button
            variant='destructive'
            size='sm'
            onClick={handleLogout}
            className='rounded-xl'
          >
            <LogOut className='h-4 w-4 mr-1' />
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className='mt-6 rounded-2xl border border-border bg-background p-6 shadow-sm'>
        <div className='mb-4'>
          <h2 className='text-lg font-semibold'>Thông tin cá nhân</h2>
          <p className='text-sm text-muted-foreground'>
            Chỉnh sửa thông tin và bấm{' '}
            <span className='font-semibold'>Lưu</span> để cập nhật
          </p>
        </div>

        <Form {...form}>
          <form className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập họ và tên'
                      className='rounded-xl border-border focus-visible:ring-ring'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Email</label>
              <p className='text-sm py-2'>{profile?.email}</p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
