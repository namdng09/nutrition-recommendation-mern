import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Camera,
  LogOut,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { cn } from '~/lib/utils';
import { logout } from '~/store/features/auth-slice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: response => {
      toast.success(response?.message || 'Profile updated successfully');
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    }
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  const form = useForm({
    resolver: yupResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name || '',
          gender: profile.gender || '',
          dob: profile.dob ? profile.dob.split('T')[0] : '',
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-center'>
        <div className='relative'>
          <div
            className='relative cursor-pointer group'
            onClick={handleAvatarClick}
          >
            <Avatar className='h-24 w-24'>
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
            <div className='absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center'>
              <Camera className='h-3.5 w-3.5' />
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
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full'>
              <Spinner className='text-white' />
            </div>
          )}
        </div>

        <div className='flex-1 text-center md:text-left'>
          <h1 className='text-2xl font-bold'>{profile?.name}</h1>
          <p className='text-muted-foreground'>{profile?.email}</p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            onClick={form.handleSubmit(handleSave)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner className='h-4 w-4 mr-1' />
            ) : (
              <Save className='h-4 w-4 mr-1' />
            )}
            Save
          </Button>
          <Button variant='destructive' size='sm' onClick={handleLogout}>
            <LogOut className='h-4 w-4 mr-1' />
            Logout
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Personal Information</h2>
        <Form {...form}>
          <form className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-1'>
              <label className='text-sm font-medium text-muted-foreground'>
                Email
              </label>
              <p className='text-sm py-2'>{profile?.email}</p>
            </div>

            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Gender
                  </FormLabel>
                  <Select
                    key={profile?.id + '-gender-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
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
                  <FormLabel className='text-muted-foreground'>
                    Date of Birth
                  </FormLabel>
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
                        key={profile?.id + '-dob-' + (field.value ?? '')}
                        mode='single'
                        captionLayout='dropdown'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={date => {
                          field.onChange(
                            date ? format(date, 'yyyy-MM-dd') : ''
                          );
                        }}
                        disabled={date =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        defaultMonth={
                          field.value
                            ? new Date(field.value)
                            : new Date(2000, 0)
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
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
