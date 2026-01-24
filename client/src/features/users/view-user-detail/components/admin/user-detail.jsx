import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Save,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
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
import { ROLE_OPTIONS } from '~/constants/role';
import { STATUS_OPTIONS } from '~/constants/status';
import DeleteUserDialog from '~/features/users/delete-user/components/admin/delete-user-dialog';
import { useUpdateUser } from '~/features/users/update-user/api/update-user';
import { updateUserSchema } from '~/features/users/update-user/schemas/update-user-schema';
import { useUserDetail } from '~/features/users/view-user-detail/api/view-user-detail';
import { getRoleLabel } from '~/lib/utils';
import { cn } from '~/lib/utils';

const UserDetail = ({ id }) => {
  const navigate = useNavigate();

  const { data: user } = useUserDetail(id);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
    onSuccess: response => {
      toast.success(response.message || 'Cập nhật người dùng thành công');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Cập nhật người dùng thất bại'
      );
    }
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm({
    resolver: yupResolver(updateUserSchema),
    values: user
      ? {
          email: user.email || '',
          name: user.name || '',
          gender: user.gender || '',
          role: user.role || '',
          dob: user.dob ? user.dob.split('T')[0] : '',
          isActive: user.isActive?.toString() || 'true'
        }
      : undefined
  });

  const handleSave = data => {
    updateUser({ id, data });
  };

  const handleToggleActive = () => {
    updateUser({ id, data: { isActive: !user.isActive } });
  };

  const handleBack = () => {
    navigate('/admin/manage-users');
  };

  const handleDeleteSuccess = () => {
    navigate('/admin/manage-users');
  };

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-muted-foreground'>Không tìm thấy người dùng</p>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <Button variant='ghost' size='sm' onClick={handleBack} className='mb-4'>
        <ArrowLeft className='h-4 w-4 mr-1' />
        Quay lại danh sách
      </Button>

      <div className='flex flex-col items-center gap-4 p-6 bg-card rounded-lg border mb-6 md:flex-row md:items-center'>
        <Avatar className='h-24 w-24'>
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>
            <img
              src='/default-avatar.jpg'
              alt='Default avatar'
              className='h-full w-full object-cover'
            />
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2'>
            <h2 className='text-2xl font-bold'>{user?.name}</h2>
            <Badge variant={user?.isActive ? 'default' : 'secondary'}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className='text-muted-foreground'>{user?.email}</p>
          <Badge variant='outline' className='mt-1'>
            {getRoleLabel(user?.role)}
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={user?.isActive ? 'secondary' : 'default'}
            size='sm'
            onClick={handleToggleActive}
            disabled={isUpdating}
          >
            {user?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
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
            Lưu
          </Button>
        </div>
      </div>

      <div className='bg-card rounded-lg border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Thông tin người dùng</h2>
        <Form {...form}>
          <form className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập email' {...field} />
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
                  <FormLabel className='text-muted-foreground'>
                    Họ và tên
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên' {...field} />
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
                  <FormLabel className='text-muted-foreground'>
                    Giới tính
                  </FormLabel>
                  <Select
                    key={user?.id + '-gender-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
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
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Vai trò
                  </FormLabel>
                  <Select
                    key={user?.id + '-role-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn vai trò' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map(option => (
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
                    Ngày sinh
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
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
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

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Trạng thái
                  </FormLabel>
                  <Select
                    key={user?.id + '-isActive-' + (field.value ?? '')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
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
          </form>
        </Form>

        <div className='flex justify-start items-center mt-6 pt-6 border-t'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Xóa người dùng
          </Button>
        </div>
      </div>

      <DeleteUserDialog
        user={user}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default UserDetail;
