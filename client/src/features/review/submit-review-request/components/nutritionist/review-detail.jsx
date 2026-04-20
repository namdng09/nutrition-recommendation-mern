import { useEffect, useRef } from 'react';
import {
  FaArrowLeft,
  FaCarrot,
  FaClipboardCheck,
  FaListOl,
  FaPenNib,
  FaRedo,
  FaStar
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { REVIEW_STATUS } from '~/constants/review-status';
import { useNutritionistReviewDetail } from '~/features/review/submit-review-request/api/view-review-detail';
import { useNutritionistReviewDishDetail } from '~/features/review/submit-review-request/api/view-review-dish-detail';
import { formatDateVI } from '~/lib/utils';

import EvaluateReviews from './evaluate-reviews';
import NutritionDetail from './nutrition-detail';
import UserDetail from './user-detail';

const getStatusClassName = status => {
  if (status === REVIEW_STATUS.PENDING) {
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  if (status === REVIEW_STATUS.EVALUATED) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  }

  return 'border-border bg-muted text-slate-600';
};

const DetailSkeleton = () => {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-10 w-28' />
      <Skeleton className='h-72 w-full rounded-xl' />
      <Skeleton className='h-48 w-full rounded-xl' />
      <Skeleton className='h-52 w-full rounded-xl' />
    </div>
  );
};

const EmptyReviewDetail = () => (
  <div className='flex min-h-[45vh] items-center justify-center px-6'>
    <div className='rounded-xl border bg-card px-6 py-4 text-sm text-slate-600 shadow-sm'>
      Không tìm thấy dữ liệu món ăn để đánh giá.
    </div>
  </div>
);

const EvaluationOverview = ({ evaluation }) => {
  if (!evaluation) return null;

  const formattedEvaluatedAt = evaluation?.evaluatedAt
    ? formatDateVI(evaluation.evaluatedAt, "HH:mm 'ngày' dd/MM/yyyy")
    : 'Chưa có';

  return (
    <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
      <div className='flex items-center gap-2'>
        <FaClipboardCheck className='text-slate-600' />
        <h2 className='text-lg font-semibold text-foreground'>
          Thông tin đánh giá
        </h2>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <div className='rounded-lg border bg-muted/20 p-3'>
          <p className='text-xs uppercase tracking-wider text-slate-600'>
            Trạng thái
          </p>
          <p className='mt-1 text-sm font-semibold text-foreground'>
            {evaluation?.status || 'Chưa có'}
          </p>
        </div>

        <div className='rounded-lg border bg-muted/20 p-3'>
          <p className='text-xs uppercase tracking-wider text-slate-600'>
            Điểm
          </p>
          <p className='mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground'>
            <FaStar className='text-amber-500' />
            {evaluation?.rating ? `${evaluation.rating}/5` : 'Chưa có'}
          </p>
        </div>

        <div className='rounded-lg border bg-muted/20 p-3'>
          <p className='text-xs uppercase tracking-wider text-slate-600'>
            Thời gian
          </p>
          <p className='mt-1 text-sm font-semibold text-foreground'>
            {formattedEvaluatedAt}
          </p>
        </div>
      </div>

      <div className='rounded-lg border bg-muted/20 p-4'>
        <p className='text-xs uppercase tracking-wider text-slate-600'>
          Nhận xét
        </p>
        <p className='mt-2 whitespace-pre-line text-sm leading-6 text-foreground'>
          {evaluation?.feedback || 'Chưa có nhận xét.'}
        </p>
      </div>
    </section>
  );
};

const IngredientSection = ({ ingredients }) => {
  if (!ingredients?.length) return null;

  return (
    <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
      <div className='flex items-center gap-2'>
        <FaCarrot className='text-orange-500' />
        <h2 className='text-lg font-semibold text-foreground'>Nguyên liệu</h2>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        {ingredients.map((item, index) => {
          const defaultUnit = item?.units?.find(unit => unit?.isDefault);

          return (
            <div
              key={item?._id || `${item?.ingredientId || 'ing'}-${index}`}
              className='flex items-center gap-3 rounded-lg border bg-muted/20 p-3'
            >
              <img
                src={item?.image || '/placeholder.png'}
                alt={item?.name || 'ingredient'}
                className='h-14 w-14 rounded-lg border object-cover'
              />

              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-foreground'>
                  {item?.name || '-'}
                </p>
                <p className='mt-1 text-xs text-slate-600'>
                  {defaultUnit?.quantity ?? '-'} {defaultUnit?.unit ?? ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const InstructionSection = ({ instructions }) => {
  if (!instructions?.length) return null;

  return (
    <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
      <div className='flex items-center gap-2'>
        <FaListOl className='text-sky-600' />
        <h2 className='text-lg font-semibold text-foreground'>Cách chế biến</h2>
      </div>

      <div className='space-y-3'>
        {instructions.map((step, index) => (
          <div
            key={step?._id || `${step?.step || 'step'}-${index}`}
            className='rounded-lg border bg-muted/20 p-4'
          >
            <p className='text-xs font-semibold uppercase tracking-wider text-slate-600'>
              Bước {index + 1}
            </p>
            <p className='mt-2 whitespace-pre-line text-sm leading-6 text-foreground'>
              {step?.description || '-'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const NutritionistReviewDetail = ({ dishId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const evaluateSectionRef = useRef(null);

  const {
    data: reviewDetail,
    isLoading: isLoadingReview,
    isError: isReviewError,
    refetch: refetchReview
  } = useNutritionistReviewDetail(dishId);

  const {
    data: dishDetail,
    isLoading: isLoadingDish,
    isError: isDishError,
    refetch: refetchDish
  } = useNutritionistReviewDishDetail(dishId);

  useEffect(() => {
    if (
      searchParams.get('action') === 'evaluate' &&
      evaluateSectionRef.current
    ) {
      evaluateSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [searchParams]);

  if (isLoadingReview || isLoadingDish) {
    return <DetailSkeleton />;
  }

  if (isReviewError) {
    return (
      <div className='flex min-h-[45vh] items-center justify-center px-6'>
        <div className='rounded-2xl border border-destructive/40 bg-destructive/5 px-6 py-4 text-sm text-destructive shadow-sm'>
          Không thể tải chi tiết yêu cầu đánh giá. Vui lòng thử lại.
          <div className='mt-4 flex gap-2'>
            <Button variant='outline' onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button
              onClick={() => {
                refetchReview();
                refetchDish();
              }}
            >
              <FaRedo className='mr-2 h-3.5 w-3.5' />
              Tải lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dish = {
    ...(dishDetail || {}),
    ...(reviewDetail || {}),
    user: reviewDetail?.user || dishDetail?.user,
    evaluation: reviewDetail?.evaluation || dishDetail?.evaluation
  };

  const canRenderDish = Boolean(
    dish._id || reviewDetail?._id || dishDetail?._id
  );

  if (!canRenderDish) {
    return <EmptyReviewDetail />;
  }

  const showDishWarning = isDishError;

  const totalCalories =
    dish?.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')?.value ?? 0;
  const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

  const reviewStatus = dish?.evaluation?.status || '';
  const isEvaluated = reviewStatus === REVIEW_STATUS.EVALUATED;

  return (
    <div className='min-h-screen bg-background px-4 py-6 text-foreground md:px-6 md:py-8'>
      <div className='mx-auto w-full max-w-7xl animate-in space-y-8 fade-in duration-500'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 self-start rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent'
          >
            <FaArrowLeft className='text-xs' />
            Quay lại
          </button>

          <div
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClassName(reviewStatus)}`}
          >
            {reviewStatus || 'Không xác định'}
          </div>
        </div>

        <section className='grid gap-5 rounded-xl border bg-card p-4 md:grid-cols-[260px_minmax(0,1fr)] md:p-6'>
          <img
            src={dish.image || '/logo2.png'}
            alt={dish.name || 'dish'}
            className='h-56 w-full rounded-lg border object-cover md:h-full'
          />

          <div className='space-y-4'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl'>
                {dish.name || 'Món ăn riêng của người dùng'}
              </h1>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {dish.description ||
                  'Yêu cầu đánh giá món ăn riêng tư được gửi từ người dùng.'}
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='text-xs uppercase tracking-wider text-slate-600'>
                  Năng lượng
                </p>
                <p className='mt-1 text-sm font-semibold text-foreground'>
                  {Math.round(Number(totalCalories || 0))} kcal
                </p>
              </div>

              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='text-xs uppercase tracking-wider text-slate-600'>
                  Tổng thời gian
                </p>
                <p className='mt-1 text-sm font-semibold text-foreground'>
                  {totalTime} phút
                </p>
              </div>

              <div className='rounded-lg border bg-muted/20 p-3'>
                <p className='text-xs uppercase tracking-wider text-slate-600'>
                  Khẩu phần
                </p>
                <p className='mt-1 text-sm font-semibold text-foreground'>
                  {dish.servings ?? 0} người
                </p>
              </div>
            </div>
          </div>
        </section>

        <UserDetail
          user={dish.user}
          requestCreatedAt={reviewDetail?.createdAt || dishDetail?.createdAt}
          requestUpdatedAt={reviewDetail?.updatedAt || dishDetail?.updatedAt}
        />

        <NutritionDetail nutrition={dish.nutrition} />

        <IngredientSection ingredients={dish.ingredients} />

        <InstructionSection instructions={dish.instructions} />

        <EvaluationOverview evaluation={dish.evaluation} />

        {!isEvaluated ? (
          <div ref={evaluateSectionRef}>
            <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
              <div className='flex items-center gap-2'>
                <FaPenNib className='text-emerald-600' />
                <h2 className='text-lg font-semibold text-foreground'>
                  Đánh giá yêu cầu món ăn
                </h2>
              </div>

              {showDishWarning ? (
                <div className='rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
                  Không tải được đầy đủ thông tin món ăn, đang hiển thị dữ liệu
                  từ yêu cầu review.
                  <button
                    type='button'
                    onClick={() => refetchDish()}
                    className='ml-2 underline underline-offset-2'
                  >
                    Thử lại
                  </button>
                </div>
              ) : null}

              <p className='text-sm text-slate-600'>
                Bạn đang đánh giá món ăn riêng của người dùng dựa trên thành
                phần, cách chế biến và mục tiêu dinh dưỡng của món ăn.
              </p>

              <EvaluateReviews
                dishId={dish._id}
                dishName={dish.name}
                onSuccess={() => {
                  refetchReview();
                  refetchDish();
                }}
              />
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NutritionistReviewDetail;
