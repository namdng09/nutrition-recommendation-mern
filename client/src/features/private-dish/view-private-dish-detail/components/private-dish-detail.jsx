import React from 'react';
import {
  FaArrowLeft,
  FaCarrot,
  FaClipboardCheck,
  FaClock,
  FaCommentDots,
  FaEdit,
  FaFireAlt,
  FaListOl,
  FaStar,
  FaTrash,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { Link, useNavigate, useParams } from 'react-router';

import DishFavoriteDetailButton from '~/features/dishes/add-dish-to-favorite/components/dish-favorite-detail-button';
import BlockToggleDishButton from '~/features/dishes/block-dish/components/block-toggle-dish-button';
import SubmitReviewButton from '~/features/review/submit-review-request/components/submit-review-button';
import { formatDateVI } from '~/lib/utils';

import { useDeletePrivateDish } from '../../delete-private-dish/api/delete-private-dish';
import { usePrivateDishDetail } from '../api/view-private-dish-detail';

function StatCard({ icon, label, value, tone = 'orange' }) {
  const toneMap = {
    orange: {
      wrapper:
        'border-orange-200/70 bg-orange-50/80 dark:border-orange-500/20 dark:bg-orange-500/10',
      icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
    },
    emerald: {
      wrapper:
        'border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10',
      icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
    },
    sky: {
      wrapper:
        'border-sky-200/70 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10',
      icon: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300'
    }
  };

  return (
    <div
      className={`rounded-[26px] border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${toneMap[tone].wrapper}`}
    >
      <div className='flex items-start gap-3'>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneMap[tone].icon}`}
        >
          {icon}
        </div>

        <div className='min-w-0'>
          <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
            {label}
          </p>
          <p className='mt-1 text-lg font-black tracking-tight text-foreground'>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, count, iconTone = 'primary', children }) {
  const iconToneMap = {
    primary: 'bg-primary/10 text-primary',
    orange:
      'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    emerald:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber:
      'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'
  };

  return (
    <section className='overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_16px_40px_rgba(15,23,42,0.05)]'>
      <div className='flex items-center justify-between border-b border-border/70 px-5 py-5 md:px-7'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconToneMap[iconTone]}`}
          >
            {icon}
          </div>

          <h2 className='text-xl font-black tracking-tight text-foreground md:text-2xl'>
            {title}
          </h2>
        </div>

        {typeof count === 'number' ? (
          <span className='inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-muted px-3 text-sm font-bold text-foreground'>
            {count}
          </span>
        ) : null}
      </div>

      <div className='p-5 md:p-7'>{children}</div>
    </section>
  );
}

function EvaluationInfoCard({ label, value, tone = 'stone', icon = null }) {
  const toneMap = {
    emerald:
      'border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10',
    amber:
      'border-amber-200/70 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10',
    sky: 'border-sky-200/70 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10',
    stone: 'border-border bg-muted/40'
  };

  return (
    <div
      className={`rounded-[24px] border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${toneMap[tone]}`}
    >
      <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
        {label}
      </p>

      <div className='mt-3 flex items-center gap-3'>
        {icon ? (
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-background shadow-sm'>
            {icon}
          </div>
        ) : null}

        <p className='text-base font-black tracking-tight text-foreground md:text-lg'>
          {value}
        </p>
      </div>
    </div>
  );
}

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
    return (
      <div className='flex min-h-[45vh] items-center justify-center px-6'>
        <div className='rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-muted-foreground shadow-sm'>
          Đang tải món ăn...
        </div>
      </div>
    );
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

        <section className='overflow-hidden rounded-[36px] border border-border bg-card shadow-[0_20px_60px_rgba(15,23,42,0.06)]'>
          <div className='grid gap-0 lg:grid-cols-[420px_minmax(0,1fr)]'>
            <div className='relative border-b border-border bg-muted lg:border-b-0 lg:border-r'>
              <img
                src={dish.image || '/placeholder.png'}
                alt={dish.name}
                className='aspect-[4/5] h-full w-full object-cover'
              />

              <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 via-black/10 to-transparent dark:from-black/70 dark:via-black/20' />

              <div className='absolute left-5 top-5 flex flex-wrap gap-2'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/40 dark:text-white'>
                  <HiSparkles className='text-sm text-orange-500 dark:text-orange-300' />
                  Private dish
                </span>
              </div>
            </div>

            <div className='flex flex-col justify-between p-6 md:p-8 xl:p-10'>
              <div className='space-y-6'>
                <div className='flex flex-wrap gap-2'>
                  <span className='inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'>
                    <HiSparkles className='text-sm' />
                    Món ăn do người dùng tạo
                  </span>

                  {dish.tags?.map(tag => (
                    <span
                      key={tag}
                      className='inline-flex items-center rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className='space-y-3'>
                  <h1 className='text-3xl font-black tracking-tight text-foreground md:text-5xl xl:text-6xl'>
                    {dish.name}
                  </h1>

                  {dish.description ? (
                    <p className='max-w-3xl text-sm leading-7 text-muted-foreground md:text-base'>
                      {dish.description}
                    </p>
                  ) : (
                    <p className='max-w-3xl text-sm leading-7 text-muted-foreground md:text-base'>
                      Công thức món ăn riêng do người dùng tự tạo và lưu trong
                      bộ sưu tập cá nhân.
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <StatCard
                    icon={<FaFireAlt />}
                    label='Năng lượng'
                    value={`${totalCalories} kcal`}
                    tone='orange'
                  />
                  <StatCard
                    icon={<FaClock />}
                    label='Tổng thời gian'
                    value={`${totalTime} phút`}
                    tone='emerald'
                  />
                  <StatCard
                    icon={<FaUtensils />}
                    label='Khẩu phần'
                    value={`${dish.servings ?? 0} người`}
                    tone='sky'
                  />
                </div>
              </div>

              <div className='mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between'>
                {dish.user ? (
                  <div className='flex items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                      <FaUser className='text-base' />
                    </div>

                    <div className='min-w-0'>
                      <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
                        Người tạo công thức
                      </p>
                      <div className='truncate text-base font-black tracking-tight text-foreground'>
                        {dish.user.name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                <Link
                  to={`/dishes/${id}/nutrition`}
                  className='inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-sm transition hover:opacity-90'
                >
                  <FaFireAlt className='text-xs' />
                  Xem chi tiết dinh dưỡng
                </Link>
              </div>
            </div>
          </div>
        </section>

        {evaluation ? (
          <SectionCard
            icon={<FaClipboardCheck />}
            title='Đánh giá từ chuyên gia dinh dưỡng'
            iconTone='primary'
          >
            <div className='grid gap-4 lg:grid-cols-3'>
              <EvaluationInfoCard
                label='Trạng thái'
                value={evaluation.status || 'Chưa có'}
                tone='emerald'
              />

              <EvaluationInfoCard
                label='Điểm đánh giá'
                value={evaluation.rating ?? '--'}
                tone='amber'
                icon={
                  <FaStar className='text-sm text-amber-500 dark:text-amber-300' />
                }
              />

              <EvaluationInfoCard
                label='Thời gian đánh giá'
                value={formattedEvaluatedAt}
                tone='sky'
              />
            </div>

            <div className='mt-5 rounded-[28px] border border-border bg-muted/40 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]'>
              <div className='flex items-center gap-3'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                  <FaCommentDots />
                </div>

                <div>
                  <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
                    Nhận xét
                  </p>
                  <p className='text-sm font-semibold text-foreground'>
                    Feedback từ chuyên gia
                  </p>
                </div>
              </div>

              <div className='mt-4 rounded-[22px] bg-background p-4 text-sm leading-7 text-foreground shadow-sm'>
                {evaluation.feedback || 'Chưa có nhận xét.'}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {dish.ingredients?.length > 0 ? (
          <SectionCard
            icon={<FaCarrot />}
            title='Nguyên liệu'
            count={dish.ingredients.length}
            iconTone='orange'
          >
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {dish.ingredients.map(item => {
                const unit = item.units?.find(u => u.isDefault);

                return (
                  <Link
                    key={item._id}
                    to={`/ingredients/${item.ingredientId}`}
                    className='group rounded-[28px] border border-border bg-gradient-to-br from-background to-orange-50/35 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/60 dark:to-orange-500/5 dark:hover:border-orange-500/20 dark:hover:bg-orange-500/10'
                  >
                    <div className='flex items-center gap-4'>
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className='h-16 w-16 rounded-2xl border border-border bg-muted object-cover shadow-sm'
                      />

                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-base font-bold text-foreground'>
                          {item.name}
                        </p>

                        <div className='mt-2 inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm'>
                          {unit?.quantity ?? '-'} {unit?.unit ?? ''}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        ) : null}

        {dish.instructions?.length > 0 ? (
          <SectionCard icon={<FaListOl />} title='Cách chế biến' iconTone='sky'>
            <div className='space-y-4'>
              {dish.instructions.map((step, idx) => (
                <div
                  key={step._id}
                  className='rounded-[28px] border border-border bg-gradient-to-br from-background to-sky-50/40 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:to-sky-500/5'
                >
                  <div className='flex gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'>
                      {idx + 1}
                    </div>

                    <div className='flex-1 pt-1'>
                      <p className='text-sm font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300'>
                        Bước {idx + 1}
                      </p>
                      <p className='mt-2 leading-7 text-foreground/90'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
