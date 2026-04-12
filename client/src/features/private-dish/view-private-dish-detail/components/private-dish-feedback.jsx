import React from 'react';
import {
  FaClipboardCheck,
  FaCommentDots,
  FaStar,
  FaUserMd
} from 'react-icons/fa';
import { Link } from 'react-router';

import { useNutritionistDetail } from '~/features/users/view-nutritionist-detail/api/view-nutritionist-detail';

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

function EvaluatedNutritionistCard({ nutritionistId }) {
  const { data } = useNutritionistDetail(nutritionistId);
  const nutritionist = data?.data || data;

  return (
    <Link
      to={`/nutritionists/${nutritionistId}`}
      className='group mt-5 flex items-center gap-4 rounded-[30px] border border-border/70 bg-card p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-primary/20 hover:bg-accent/40 hover:shadow-[0_14px_34px_rgba(15,23,42,0.06)]'
    >
      <div className='relative shrink-0'>
        {nutritionist?.avatar ? (
          <img
            src={nutritionist.avatar}
            alt={nutritionist.name}
            className='h-14 w-14 rounded-[20px] border border-border object-cover shadow-sm'
          />
        ) : (
          <div className='flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-sm'>
            <FaUserMd className='text-lg' />
          </div>
        )}

        <div className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm'>
          <FaUserMd className='text-[10px]' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
          Chuyên gia đã đánh giá món ăn của bạn
        </p>
        <p className='mt-1 truncate text-base font-black tracking-tight text-foreground'>
          {nutritionist?.name || 'Đang tải thông tin chuyên gia'}
        </p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Xem thông tin chi tiết chuyên gia
        </p>
      </div>

      <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary'>
        <svg
          viewBox='0 0 20 20'
          fill='none'
          className='h-4 w-4'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M7.5 5L12.5 10L7.5 15'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    </Link>
  );
}

export default function PrivateDishFeedback({
  evaluation,
  formattedEvaluatedAt,
  SectionCard
}) {
  if (!evaluation) return null;

  const nutritionistId =
    evaluation?.nutritionist?._id || evaluation?.nutritionistId;

  return (
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
          value={evaluation.rating ?? 'Chưa được đánh giá'}
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

      {nutritionistId ? (
        <EvaluatedNutritionistCard nutritionistId={nutritionistId} />
      ) : null}

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
  );
}
