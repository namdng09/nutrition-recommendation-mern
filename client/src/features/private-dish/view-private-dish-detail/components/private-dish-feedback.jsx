import React from 'react';
import { FaClipboardCheck, FaCommentDots, FaStar } from 'react-icons/fa';

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

export default function PrivateDishFeedback({
  evaluation,
  formattedEvaluatedAt,
  SectionCard
}) {
  if (!evaluation) return null;

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
