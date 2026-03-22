import { yupResolver } from '@hookform/resolvers/yup';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
  XCircle
} from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as yup from 'yup';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { Switch } from '~/components/ui/switch';
import CERTIFICATE_STATUS from '~/constants/certificate-status';
import { useToggleCertificateVisibility } from '~/features/users/manage-certificate/api/toggle-certificate-visibility';
import { useUploadCertificate } from '~/features/users/manage-certificate/api/upload-certificate';
import { useProfileForPage } from '~/features/users/view-profile/api/view-profile';

import reUploadSchema from '../schemas/re-upload-schema';

const statusConfig = {
  [CERTIFICATE_STATUS.PENDING]: {
    label: 'Đang chờ duyệt',
    icon: Clock,
    badgeClass:
      'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400'
  },
  [CERTIFICATE_STATUS.APPROVED]: {
    label: 'Đã được phê duyệt',
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

const CertificateStatus = () => {
  const { data: profile } = useProfileForPage();
  const certFileRef = useRef(null);

  const certificate = profile?.certificate;
  const status = certificate?.status;
  const config = statusConfig[status];
  const StatusIcon = config?.icon;
  const showCertificate = certificate?.showCertificate ?? true;

  const form = useForm({
    resolver: yupResolver(reUploadSchema),
    defaultValues: {
      certificateName: certificate?.name || '',
      certificate: undefined
    }
  });

  const watchedCert = form.watch('certificate');

  const { mutate: uploadCertificate, isPending: isUploading } =
    useUploadCertificate({
      onSuccess: response => {
        toast.success(response.message || 'Nộp chứng chỉ thành công');
        form.reset({ certificateName: '', certificate: undefined });
      },
      onError: error => {
        toast.error(
          error.response?.data?.message ||
            'Nộp chứng chỉ thất bại. Vui lòng thử lại.'
        );
      }
    });

  const { mutate: toggleVisibility, isPending: isToggling } =
    useToggleCertificateVisibility({
      onSuccess: response => {
        toast.success(response.message || 'Cập nhật hiển thị thành công');
      },
      onError: error => {
        toast.error(
          error.response?.data?.message ||
            'Cập nhật hiển thị thất bại. Vui lòng thử lại.'
        );
      }
    });

  const handleSubmit = data => {
    uploadCertificate({
      certificateName: data.certificateName,
      certificate: data.certificate[0]
    });
  };

  const handleToggleVisibility = () => {
    toggleVisibility(!showCertificate);
  };

  if (!certificate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chứng chỉ nghề nghiệp</CardTitle>
          <CardDescription>
            Bạn chưa nộp chứng chỉ nào. Hãy tải lên để được xét duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='certificateName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên chứng chỉ <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ví dụ: Chứng chỉ Dinh dưỡng Lâm sàng'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='certificate'
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      Tệp chứng chỉ <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div
                        className='flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background/60 p-6 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5'
                        onClick={() => certFileRef.current?.click()}
                      >
                        <Upload className='h-7 w-7 text-muted-foreground' />
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
                          ref={certFileRef}
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

              <Button
                type='submit'
                disabled={isPending}
                className='w-full sm:w-auto'
              >
                {isPending ? (
                  <>
                    <Spinner className='h-4 w-4 mr-2' />
                    Đang nộp...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Nộp chứng chỉ
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Current Certificate Card */}
      <Card>
        <CardHeader>
          <CardTitle>Chứng chỉ nghề nghiệp</CardTitle>
          <CardDescription>
            Trạng thái xét duyệt chứng chỉ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <p className='text-sm text-muted-foreground'>Tên chứng chỉ</p>
              <p className='font-medium'>{certificate.name}</p>
            </div>

            {config && (
              <Badge
                variant='outline'
                className={`gap-1.5 self-start sm:self-auto ${config.badgeClass}`}
              >
                <StatusIcon className='h-3 w-3' />
                {config.label}
              </Badge>
            )}
          </div>

          {status === CERTIFICATE_STATUS.APPROVED && (
            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div className='flex items-center gap-3'>
                {showCertificate ? (
                  <Eye className='h-4 w-4 text-green-600' />
                ) : (
                  <EyeOff className='h-4 w-4 text-muted-foreground' />
                )}
                <div>
                  <p className='text-sm font-medium'>Hiển thị với người dùng</p>
                  <p className='text-xs text-muted-foreground'>
                    {showCertificate
                      ? 'Chứng chỉ đang hiển thị trên hồ sơ của bạn'
                      : 'Chứng chỉ bị ẩn khỏi hồ sơ công khai'}
                  </p>
                </div>
              </div>
              {isToggling ? (
                <Spinner className='h-5 w-5' />
              ) : (
                <Switch
                  checked={showCertificate}
                  onCheckedChange={handleToggleVisibility}
                />
              )}
            </div>
          )}

          {certificate.url && (
            <a
              href={certificate.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4'
            >
              <ExternalLink className='h-4 w-4' />
              Xem tệp chứng chỉ
            </a>
          )}

          {status === CERTIFICATE_STATUS.REJECTED &&
            certificate.rejectionReason && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30'>
                <p className='text-sm font-medium text-red-700 dark:text-red-400'>
                  Lý do từ chối
                </p>
                <p className='mt-1 text-sm text-red-600 dark:text-red-300'>
                  {certificate.rejectionReason}
                </p>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Re-upload form — only shown when Rejected */}
      {status === CERTIFICATE_STATUS.REJECTED && (
        <Card>
          <CardHeader>
            <CardTitle>Nộp lại chứng chỉ</CardTitle>
            <CardDescription>
              Tải lên chứng chỉ mới để gửi lại yêu cầu xét duyệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='certificateName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chứng chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ví dụ: Chứng chỉ Dinh dưỡng Lâm sàng'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='certificate'
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Tệp chứng chỉ</FormLabel>
                      <FormControl>
                        <div
                          className='flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background/60 p-6 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5'
                          onClick={() => certFileRef.current?.click()}
                        >
                          <Upload className='h-7 w-7 text-muted-foreground' />
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
                            ref={certFileRef}
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

                <Button
                  type='submit'
                  disabled={isPending}
                  className='w-full sm:w-auto'
                >
                  {isPending ? (
                    <>
                      <Spinner className='h-4 w-4 mr-2' />
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <Upload className='h-4 w-4 mr-2' />
                      Nộp lại chứng chỉ
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificateStatus;
