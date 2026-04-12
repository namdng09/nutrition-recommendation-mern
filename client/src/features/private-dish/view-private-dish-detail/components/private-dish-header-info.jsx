import React from 'react';
import { FaClock, FaFireAlt, FaUser, FaUtensils } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { Link } from 'react-router';

export default function PrivateDishHeaderInfo({
  dish,
  id,
  totalCalories,
  totalTime,
  StatCard
}) {
  return (
    <section className='overflow-hidden rounded-[36px] border border-border bg-card shadow-[0_20px_60px_rgba(15,23,42,0.06)]'>
      <div className='grid gap-0 lg:grid-cols-[420px_minmax(0,1fr)]'>
        <div className='relative border-b border-border bg-muted lg:border-b-0 lg:border-r'>
          <img
            src={dish.image || '/placeholder.png'}
            alt={dish.name}
            className='aspect-[4/5] h-full w-full object-cover'
          />

          <div className='absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 via-black/10 to-transparent dark:from-black/70 dark:via-black/20' />
        </div>

        <div className='flex flex-col justify-between p-6 md:p-8 xl:p-10'>
          <div className='space-y-6'>
            <div className='flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'>
                <HiSparkles className='text-sm' />
                Món ăn cá nhân hoá cho người dùng
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
                  Công thức món ăn riêng do người dùng tự tạo và lưu trong bộ
                  sưu tập cá nhân.
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
  );
}
