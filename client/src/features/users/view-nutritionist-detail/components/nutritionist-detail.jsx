import { CheckCircle, Clock, ExternalLink, XCircle } from 'lucide-react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import CERTIFICATE_STATUS from '~/constants/certificate-status';

import { useNutritionistDetail } from '../api/view-nutritionist-detail';

const statusConfig = {
  [CERTIFICATE_STATUS.PENDING]: {
    label: 'Đang chờ duyệt',
    icon: Clock,
    className:
      'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400'
  },
  [CERTIFICATE_STATUS.APPROVED]: {
    label: 'Đã được phê duyệt',
    icon: CheckCircle,
    className:
      'border-green-400 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400'
  },
  [CERTIFICATE_STATUS.REJECTED]: {
    label: 'Bị từ chối',
    icon: XCircle,
    className:
      'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
  }
};

const formatDate = iso =>
  iso
    ? new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null;

export default function NutritionistDetail({ id }) {
  const { data: nutritionist } = useNutritionistDetail(id);
  const certificate = nutritionist?.certificate;
  const config = certificate ? statusConfig[certificate.status] : null;
  const StatusIcon = config?.icon;

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <Button variant='outline' size='sm' asChild>
        <Link to='/nutritionists'>← Quay lại danh sách</Link>
      </Button>

      {/* Profile header */}
      <div className='flex items-center gap-5'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={nutritionist.avatar} alt={nutritionist.name} />
          <AvatarFallback className='text-2xl'>
            {nutritionist.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold'>{nutritionist.name}</h1>
          <p className='text-muted-foreground'>Chuyên gia dinh dưỡng</p>
        </div>
      </div>

      {/* Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Chứng chỉ nghề nghiệp</CardTitle>
          <CardDescription>Thông tin chứng chỉ của chuyên gia</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {certificate ? (
            <>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Tên chứng chỉ</p>
                  <p className='font-medium'>{certificate.name}</p>
                </div>
                {config && (
                  <Badge
                    variant='outline'
                    className={`gap-1.5 self-start sm:self-auto ${config.className}`}
                  >
                    <StatusIcon className='h-3 w-3' />
                    {config.label}
                  </Badge>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                {certificate.submittedAt && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground'>Ngày nộp</p>
                    <p className='font-medium'>
                      {formatDate(certificate.submittedAt)}
                    </p>
                  </div>
                )}
                {certificate.reviewedAt && (
                  <div className='space-y-1'>
                    <p className='text-muted-foreground'>Ngày duyệt</p>
                    <p className='font-medium'>
                      {formatDate(certificate.reviewedAt)}
                    </p>
                  </div>
                )}
              </div>

              {certificate.fileUrl && (
                <a
                  href={certificate.fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block'
                >
                  <img
                    src={certificate.fileUrl}
                    alt={certificate.name}
                    className='w-full rounded-lg border border-border object-contain max-h-96'
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'inline-flex';
                    }}
                  />
                  <span
                    style={{ display: 'none' }}
                    className='items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4'
                  >
                    <ExternalLink className='h-4 w-4' />
                    Xem tệp chứng chỉ
                  </span>
                </a>
              )}
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Chuyên gia chưa nộp chứng chỉ.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
