import React from 'react';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router';

import DishFavoriteDetailButton from '~/features/dishes/add-dish-to-favorite/components/dish-favorite-detail-button';
import BlockToggleDishButton from '~/features/dishes/block-dish/components/block-toggle-dish-button';
import SubmitReviewButton from '~/features/review/submit-review-request/components/submit-review-button';
import { formatDateVI } from '~/lib/utils';

import { useDeletePrivateDish } from '../../delete-private-dish/api/delete-private-dish';
import { usePrivateDishDetail } from '../api/view-private-dish-detail';
import EmptyPrivateDishDetail from './empty-private-dish-detail';
import PrivateDishFeedback from './private-dish-feedback';
import PrivateDishHeaderInfo from './private-dish-header-info';
import PrivateDishIngredient from './private-dish-ingredient';
import PrivateDishInstructionsSection from './private-dish-instructions-section';
import PrivateDishSectionCard from './private-dish-section-card';
import PrivateDishStatCard from './private-dish-stat-card';

export default function PrivateDishDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: dish } = usePrivateDishDetail(id);

  const { mutate: deletePrivateDish, isPending: isDeletingDish } =
    useDeletePrivateDish({
      onSuccess: () => {
        navigate('/dishes');
      }
    });

  if (!dish) {
    return <EmptyPrivateDishDetail />;
  }

  const totalCalories =
    dish?.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')?.value ?? 0;

  const totalTime = (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);
  const reviewStatus = dish?.evaluation?.status || '';
  const evaluation = dish?.evaluation;

  const formattedEvaluatedAt = evaluation?.evaluatedAt
    ? formatDateVI(evaluation.evaluatedAt, "'Lúc' HH:mm, 'ngày' dd/MM/yyyy")
    : 'Chưa có';

  const handleDeleteDish = () => {
    deletePrivateDish({ id: dish._id });
  };

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

          <div className='flex flex-wrap items-center gap-2 rounded-[24px] border border-border bg-card/95 p-2 shadow-sm backdrop-blur'>
            <DishFavoriteDetailButton dishId={dish._id} />
            <BlockToggleDishButton dishId={dish._id} />

            <div className='mx-1 hidden h-8 w-px bg-border sm:block' />

            <SubmitReviewButton dishId={dish._id} reviewStatus={reviewStatus} />

            <Link
              to={`/private-dishes/${dish._id}/edit`}
              className='inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15'
            >
              <FaEdit className='text-xs' />
              Chỉnh sửa
            </Link>

            <button
              type='button'
              onClick={handleDeleteDish}
              disabled={isDeletingDish}
              className='inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15'
            >
              <FaTrash className='text-xs' />
              {isDeletingDish ? 'Đang xoá...' : 'Xoá món ăn'}
            </button>
          </div>
        </div>

        <PrivateDishHeaderInfo
          dish={dish}
          id={id}
          totalCalories={totalCalories}
          totalTime={totalTime}
          StatCard={PrivateDishStatCard}
        />

        <PrivateDishFeedback
          evaluation={evaluation}
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
      </div>
    </div>
  );
}
