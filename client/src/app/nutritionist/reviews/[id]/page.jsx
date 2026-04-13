import { ArrowLeft, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { REVIEW_STATUS } from '~/constants/review-status';
import { useNutritionistReviewDetail } from '~/features/review/submit-review-request/api/view-review-detail';
import EvaluateReviews from '~/features/review/submit-review-request/components/nutritionist/evaluate-reviews';
import { formatDate } from '~/lib/utils';

const getStatusClassName = status => {
  if (status === REVIEW_STATUS.PENDING) {
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  if (status === REVIEW_STATUS.EVALUATED) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  }

  return '';
};

const Page = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const evaluateSectionRef = useRef(null);

  const {
    data: reviewDetail,
    isLoading,
    isError,
    refetch
  } = useNutritionistReviewDetail(id, {
    enabled: !!id
  });

  const canEvaluate =
    reviewDetail?.evaluation?.status === REVIEW_STATUS.PENDING;
  const shouldFocusEvaluate = searchParams.get('action') === 'evaluate';

  useEffect(() => {
    if (!shouldFocusEvaluate || !canEvaluate || !evaluateSectionRef.current) {
      return;
    }

    evaluateSectionRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, [shouldFocusEvaluate, canEvaluate]);

  const clearActionQuery = () => {
    if (!searchParams.get('action')) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('action');
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className='space-y-4'>
      <Button
        type='button'
        variant='outline'
        onClick={() => navigate('/nutritionist/reviews')}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Quay lại danh sách
      </Button>

      {isLoading ? (
        <div className='space-y-3'>
          <Skeleton className='h-56 w-full rounded-md' />
          <Skeleton className='h-10 w-3/5' />
          <Skeleton className='h-24 w-full' />
        </div>
      ) : null}

      {isError ? (
        <div className='rounded-md border border-destructive/40 bg-destructive/5 p-4'>
          <p className='text-sm text-destructive'>
            Không thể tải chi tiết yêu cầu review. Vui lòng thử lại.
          </p>
          <Button variant='outline' className='mt-3' onClick={() => refetch()}>
            Tải lại
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && reviewDetail ? (
        <div className='space-y-4'>
          <div className='rounded-md border p-4 space-y-4'>
            <div className='grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]'>
              <img
                src={reviewDetail.image || '/logo2.png'}
                alt={reviewDetail.name}
                className='h-52 w-full rounded-md object-cover border'
              />

              <div className='space-y-3'>
                <h1 className='text-2xl font-semibold'>{reviewDetail.name}</h1>

                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={getStatusClassName(
                      reviewDetail.evaluation?.status
                    )}
                  >
                    {reviewDetail.evaluation?.status || '-'}
                  </Badge>

                  {reviewDetail.evaluation?.rating ? (
                    <Badge variant='secondary'>
                      <Star className='mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-400' />
                      {reviewDetail.evaluation.rating}/5
                    </Badge>
                  ) : null}
                </div>

                <p className='text-sm text-muted-foreground'>
                  Người gửi: <strong>{reviewDetail.user?.name || '-'}</strong>
                </p>

                <p className='text-sm text-muted-foreground'>
                  Ngày tạo yêu cầu: {formatDate(reviewDetail.createdAt)}
                </p>

                <p className='text-sm text-muted-foreground'>
                  Chuyên gia đánh giá:{' '}
                  <strong>
                    {reviewDetail.evaluation?.nutritionist?.name ||
                      'Chưa có chuyên gia xử lý'}
                  </strong>
                </p>
              </div>
            </div>

            <div className='rounded-md border bg-muted/30 p-3'>
              <p className='mb-1 text-sm font-medium'>Nội dung phản hồi</p>
              <p className='whitespace-pre-line text-sm text-muted-foreground'>
                {reviewDetail.evaluation?.feedback ||
                  'Chưa có phản hồi từ chuyên gia.'}
              </p>
            </div>
          </div>

          <div ref={evaluateSectionRef} className='rounded-md border p-4'>
            <h2 className='text-lg font-semibold'>Đánh giá món ăn</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Chỉ có thể gửi đánh giá khi yêu cầu đang ở trạng thái chờ đánh
              giá.
            </p>

            <div className='mt-4'>
              {canEvaluate ? (
                <EvaluateReviews
                  dishId={reviewDetail._id}
                  dishName={reviewDetail.name}
                  onSuccess={() => {
                    clearActionQuery();
                    refetch();
                  }}
                />
              ) : (
                <div className='rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700'>
                  Yêu cầu này đã được đánh giá và không thể gửi lại.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Page;
