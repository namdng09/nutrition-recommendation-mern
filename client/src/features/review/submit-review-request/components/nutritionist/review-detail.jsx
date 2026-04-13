import { useEffect, useRef } from 'react';
import { FaArrowLeft, FaPenNib } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { REVIEW_STATUS } from '~/constants/review-status';
import EmptyPrivateDishDetail from '~/features/private-dish/view-private-dish-detail/components/empty-private-dish-detail';
import PrivateDishDetailSkeleton from '~/features/private-dish/view-private-dish-detail/components/private-dish-detail-skeleton';
import PrivateDishFeedback from '~/features/private-dish/view-private-dish-detail/components/private-dish-feedback';
import PrivateDishHeaderInfo from '~/features/private-dish/view-private-dish-detail/components/private-dish-header-info';
import PrivateDishIngredient from '~/features/private-dish/view-private-dish-detail/components/private-dish-ingredient';
import PrivateDishInstructionsSection from '~/features/private-dish/view-private-dish-detail/components/private-dish-instructions-section';
import PrivateDishSectionCard from '~/features/private-dish/view-private-dish-detail/components/private-dish-section-card';
import PrivateDishStatCard from '~/features/private-dish/view-private-dish-detail/components/private-dish-stat-card';
import { useNutritionistReviewDetail } from '~/features/review/submit-review-request/api/view-review-detail';
import { useNutritionistReviewDishDetail } from '~/features/review/submit-review-request/api/view-review-dish-detail';
import { formatDateVI } from '~/lib/utils';

import EvaluateReviews from './evaluate-reviews';

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
    return <PrivateDishDetailSkeleton />;
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
            <Button onClick={() => refetchReview()}>Tải lại</Button>
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
    return <EmptyPrivateDishDetail />;
  }

  const showDishWarning = isDishError;

  const totalCalories =
    dish?.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')?.value ?? 0;
  const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

  const reviewStatus = dish?.evaluation?.status || '';
  const isEvaluated = reviewStatus === REVIEW_STATUS.EVALUATED;

  const formattedEvaluatedAt = dish?.evaluation?.evaluatedAt
    ? formatDateVI(
        dish.evaluation.evaluatedAt,
        "'Lúc' HH:mm, 'ngày' dd/MM/yyyy"
      )
    : 'Chưa có';

  return (
    <div className='min-h-screen bg-background px-4 py-6 text-foreground md:px-6 md:py-8'>
      <div className='mx-auto w-full max-w-7xl animate-in space-y-8 fade-in duration-500'>
        <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='group inline-flex items-center gap-2.5 self-start rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:bg-accent'
          >
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground/80 transition group-hover:bg-accent-foreground/10'>
              <FaArrowLeft className='text-xs transition duration-200 group-hover:-translate-x-0.5' />
            </span>
            <span>Quay lại</span>
          </button>

          <div className='inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm'>
            Trạng thái:{' '}
            <span className='ml-1 text-foreground'>{reviewStatus}</span>
          </div>
        </div>

        <PrivateDishHeaderInfo
          dish={dish}
          id={dish._id}
          totalCalories={totalCalories}
          totalTime={totalTime}
          StatCard={PrivateDishStatCard}
        />

        <PrivateDishFeedback
          evaluation={dish.evaluation}
          formattedEvaluatedAt={formattedEvaluatedAt}
          SectionCard={PrivateDishSectionCard}
        />

        <PrivateDishIngredient
          ingredients={dish.ingredients}
          SectionCard={PrivateDishSectionCard}
        />

        <PrivateDishInstructionsSection
          instructions={dish.instructions}
          SectionCard={PrivateDishSectionCard}
        />
        {!isEvaluated ? (
          <div ref={evaluateSectionRef}>
            <PrivateDishSectionCard
              icon={<FaPenNib />}
              title='Đánh giá yêu cầu món ăn'
              iconTone='emerald'
            >
              {showDishWarning ? (
                <div className='mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700'>
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

              <p className='mb-5 text-sm text-muted-foreground'>
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
            </PrivateDishSectionCard>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NutritionistReviewDetail;
