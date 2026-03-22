import { CheckCircle, Clock, EyeOff, ShieldCheck, XCircle } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import CERTIFICATE_STATUS from '~/constants/certificate-status';

import { useNutritionists } from '../api/view-nutritionist';

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

const NutritionistCard = ({ nutritionist }) => {
  const certificate = nutritionist.certificate;
  const config = certificate ? statusConfig[certificate.status] : null;
  const StatusIcon = config?.icon;
  const hasFileUrl = !!certificate?.fileUrl;
  const showCertificate = certificate?.showCertificate !== false;

  return (
    <Card className='flex flex-col h-full overflow-hidden transition-shadow hover:shadow-md'>
      <CardHeader className='flex flex-row items-center gap-4 pb-3'>
        <Avatar className='h-14 w-14'>
          <AvatarImage src={nutritionist.avatar} alt={nutritionist.name} />
          <AvatarFallback>
            {nutritionist.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <p className='font-semibold truncate'>{nutritionist.name}</p>
          <p className='text-sm text-muted-foreground'>Chuyên gia dinh dưỡng</p>
        </div>
      </CardHeader>
      <CardContent className='flex-1 space-y-3'>
        {certificate ? (
          <>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Chứng chỉ</p>
              <div className='flex items-center gap-2'>
                <p className='text-sm font-medium truncate'>
                  {certificate.name}
                </p>
                {!showCertificate && hasFileUrl === false && (
                  <EyeOff
                    className='h-3 w-3 text-muted-foreground shrink-0'
                    title='Chứng chỉ bị ẩn bởi chuyên gia'
                  />
                )}
              </div>
              {showCertificate && hasFileUrl && config && (
                <Badge
                  variant='outline'
                  className={`gap-1.5 ${config.className}`}
                >
                  <StatusIcon className='h-3 w-3' />
                  {config.label}
                </Badge>
              )}
              {!showCertificate && (
                <p className='text-xs text-muted-foreground italic'>
                  (Hình ảnh chứng chỉ bị ẩn)
                </p>
              )}
            </div>
          </>
        ) : (
          <p className='text-sm text-muted-foreground'>Chưa có chứng chỉ</p>
        )}
      </CardContent>
    </Card>
  );
};

export default function NutritionistsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get('name') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const params = useMemo(() => {
    const p = { page, limit: 9 };
    if (name) p.name = name;
    return p;
  }, [page, name]);

  const { data } = useNutritionists(params);
  const docs = data?.docs ?? [];

  const goToPrev = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(Math.max(1, page - 1)));
      return next;
    });
  }, [setSearchParams, page]);

  const goToNext = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page + 1));
      return next;
    });
  }, [setSearchParams, page]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <ShieldCheck className='h-4 w-4' />
        <span>
          Tổng:{' '}
          <span className='font-medium text-foreground'>
            {data?.totalDocs ?? 0}
          </span>{' '}
          chuyên gia
        </span>
      </div>

      {docs.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <ShieldCheck className='h-12 w-12 text-muted-foreground/40 mb-4' />
          <p className='text-muted-foreground'>
            Không tìm thấy chuyên gia dinh dưỡng nào
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {docs.map(n => (
            <Link key={n._id} to={`/nutritionists/${n._id}`} className='block'>
              <NutritionistCard nutritionist={n} />
            </Link>
          ))}
        </div>
      )}

      <div className='flex items-center justify-between pt-2'>
        <Button
          variant='outline'
          onClick={goToPrev}
          disabled={!data?.hasPrevPage}
        >
          Trước
        </Button>
        <span className='text-sm text-muted-foreground'>
          Trang{' '}
          <span className='font-semibold text-foreground'>{data?.page}</span> /{' '}
          <span className='font-semibold text-foreground'>
            {data?.totalPages}
          </span>
        </span>
        <Button
          variant='outline'
          onClick={goToNext}
          disabled={!data?.hasNextPage}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
