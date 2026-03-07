import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  Save,
  Trash2,
  XCircle
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
import { Textarea } from '~/components/ui/textarea';
import { GENDER_OPTIONS } from '~/constants/gender';
import { ROLE, ROLE_OPTIONS } from '~/constants/role';
import { STATUS_OPTIONS } from '~/constants/status';
import DeleteUserDialog from '~/features/users/delete-user/components/admin/delete-user-dialog';
import { useApproveCertificate } from '~/features/users/manage-certificate/api/approve-certificate';
import { useRejectCertificate } from '~/features/users/manage-certificate/api/reject-certificate';
import { useUpdateUser } from '~/features/users/update-user/api/update-user';
import { updateUserSchema } from '~/features/users/update-user/schemas/update-user-schema';
import { useUserDetail } from '~/features/users/view-user-detail/api/view-user-detail';
import { getRoleLabel } from '~/lib/utils';
import { cn } from '~/lib/utils';

const CERTIFICATE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const certStatusConfig = {
  [CERTIFICATE_STATUS.PENDING]: {
    label: 'Đang chờ duyệt',
    icon: Clock,
    badgeClass:
      'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400'
  },
  [CERTIFICATE_STATUS.APPROVED]: {
    label: 'Đã phê duyệt',
    icon: CheckCircle,
    badgeClass:
      'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400'
  },
  [CERTIFICATE_STATUS.REJECTED]: {
    label: 'Bị từ chối',
    icon: XCircle,
    badgeClass:
      'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
  }
};

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

  const { mutate: approveCertificate, isPending: isApproving } =
    useApproveCertificate({
      onSuccess: response => {
        toast.success(response.message || 'Phê duyệt chứng chỉ thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Phê duyệt chứng chỉ thất bại'
        );
      }
    });

  const { mutate: rejectCertificate, isPending: isRejecting } =
    useRejectCertificate({
      onSuccess: response => {
        toast.success(response.message || 'Từ chối chứng chỉ thành công');
        setRejectReason('');
        setShowRejectInput(false);
      },
      onError: error => {
        toast.error(
          error.response?.data?.message || 'Từ chối chứng chỉ thất bại'
        );
      }
    });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

      {/* Certificate section — Nutritionist only */}
      {user.role === ROLE.NUTRITIONIST &&
        (() => {
          const cert = user.certificate;
          const certConfig = cert ? certStatusConfig[cert.status] : null;
          const CertIcon = certConfig?.icon;
          return (
            <div className='bg-card rounded-lg border p-6 mt-6'>
              <h2 className='text-lg font-semibold mb-4'>
                Chứng chỉ nghề nghiệp
              </h2>

              {!cert ? (
                <p className='text-sm text-muted-foreground'>
                  Chuyên gia này chưa nộp chứng chỉ nào.
                </p>
              ) : (
                <div className='space-y-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm text-muted-foreground'>
                        Tên chứng chỉ
                      </p>
                      <p className='font-medium'>{cert.name}</p>
                    </div>
                    {certConfig && (
                      <Badge
                        variant='outline'
                        className={`gap-1.5 self-start sm:self-auto ${certConfig.badgeClass}`}
                      >
                        <CertIcon className='h-3 w-3' />
                        {certConfig.label}
                      </Badge>
                    )}
                  </div>

                  {cert.url && (
                    <a
                      href={cert.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4'
                    >
                      <ExternalLink className='h-4 w-4' />
                      Xem tệp chứng chỉ
                    </a>
                  )}

                  {cert.status === CERTIFICATE_STATUS.REJECTED &&
                    cert.rejectionReason && (
                      <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30'>
                        <p className='text-sm font-medium text-red-700 dark:text-red-400'>
                          Lý do từ chối trước đó
                        </p>
                        <p className='mt-1 text-sm text-red-600 dark:text-red-300'>
                          {cert.rejectionReason}
                        </p>
                      </div>
                    )}

                  {cert.status !== CERTIFICATE_STATUS.APPROVED && (
                    <div className='flex flex-wrap gap-2 pt-2 border-t'>
                      <Button
                        size='sm'
                        onClick={() => approveCertificate({ id })}
                        disabled={isApproving || isRejecting}
                      >
                        {isApproving ? (
                          <Spinner className='h-4 w-4 mr-1' />
                        ) : (
                          <CheckCircle className='h-4 w-4 mr-1' />
                        )}
                        Phê duyệt
                      </Button>

                      {!showRejectInput ? (
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => setShowRejectInput(true)}
                          disabled={isApproving || isRejecting}
                        >
                          <XCircle className='h-4 w-4 mr-1' />
                          Từ chối
                        </Button>
                      ) : (
                        <div className='w-full space-y-2'>
                          <Textarea
                            placeholder='Nhập lý do từ chối...'
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            className='resize-none'
                          />
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => {
                                if (!rejectReason.trim()) {
                                  toast.error('Vui lòng nhập lý do từ chối');
                                  return;
                                }
                                rejectCertificate({
                                  id,
                                  rejectionReason: rejectReason
                                });
                              }}
                              disabled={isRejecting}
                            >
                              {isRejecting ? (
                                <Spinner className='h-4 w-4 mr-1' />
                              ) : (
                                <XCircle className='h-4 w-4 mr-1' />
                              )}
                              Xác nhận từ chối
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                setShowRejectInput(false);
                                setRejectReason('');
                              }}
                              disabled={isRejecting}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

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
