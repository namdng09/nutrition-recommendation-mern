import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function ExerciseHeader() {
  return (
    <div className='relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between'>
      <div className='space-y-5'>
        <div className='space-y-3'>
          <h2 className='flex items-center gap-3 text-3xl md:text-4xl font-extrabold tracking-tight'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary'>
              <HiOutlineSparkles className='text-xl' />
            </div>

            <span className='text-foreground'>
              Hệ Thống{' '}
              <span className='bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent'>
                Bài Tập
              </span>
            </span>
          </h2>

          <p className='max-w-lg text-muted-foreground leading-relaxed text-sm md:text-base'>
            Khám phá danh sách bài tập được thiết kế chuyên sâu giúp bạn phát
            triển sức mạnh, cải thiện thể lực và đạt mục tiêu thể hình nhanh
            chóng.
          </p>
        </div>
      </div>
      <div className='absolute -bottom-7 left-0 h-px w-full bg-gradient-to-r from-border via-border/40 to-transparent' />
    </div>
  );
}
