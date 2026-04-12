import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function ExerciseHeader() {
  return (
    <div className='relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/[0.08] via-background to-background px-6 py-8 shadow-sm sm:px-8 sm:py-10'>
      <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-14 left-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl' />

      <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-2xl space-y-4'>
          <h2 className='flex flex-wrap items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl'>
            <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm'>
              <HiOutlineSparkles className='text-[22px]' />
            </span>

            <span className='text-foreground'>
              Hệ Thống{' '}
              <span className='bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent'>
                Bài Tập
              </span>
            </span>
          </h2>

          <p className='max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]'>
            Khám phá danh sách bài tập được thiết kế chuyên sâu giúp bạn phát
            triển sức mạnh, cải thiện thể lực và đạt mục tiêu thể hình nhanh
            chóng.
          </p>
        </div>
      </div>
    </div>
  );
}
