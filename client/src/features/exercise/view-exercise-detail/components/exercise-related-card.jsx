import React from 'react';
import { HiOutlineChevronRight, HiOutlinePlay } from 'react-icons/hi';
import { Link } from 'react-router';

import { getPreviewImage, isGifUrl } from '~/lib/utils';

export default function ExerciseRelatedCard({ exercise }) {
  const isGif = isGifUrl(exercise?.tutorial);
  const preview = getPreviewImage(exercise?.tutorial);

  return (
    <Link
      to={`/exercises/${exercise._id}`}
      className='group min-w-[300px] max-w-[300px] overflow-hidden rounded-[28px] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/60 transition-all duration-300 hover:ring-primary/20 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]'
    >
      <div className='relative h-48 w-full overflow-hidden bg-muted'>
        <img
          src={preview}
          alt={exercise?.name}
          loading='lazy'
          decoding='async'
          className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
          onMouseEnter={e => {
            if (isGif) e.currentTarget.src = exercise.tutorial;
          }}
          onMouseLeave={e => {
            if (isGif) e.currentTarget.src = preview;
          }}
        />

        <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent' />

        <div className='absolute inset-x-0 bottom-0 p-4'>
          <span className='inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur'>
            <HiOutlinePlay className='text-primary' size={12} />
            Video hướng dẫn
          </span>
        </div>
      </div>

      <div className='space-y-4 p-5'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'>
            {exercise?.difficulty || 'Trung bình'}
          </span>

          {exercise?.type ? (
            <span className='rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'>
              {exercise.type}
            </span>
          ) : null}
        </div>

        <h3 className='line-clamp-2 text-lg font-black leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary'>
          {exercise?.name}
        </h3>

        <div className='flex items-center justify-between border-t border-border/60 pt-3'>
          <span className='text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-primary'>
            Xem chi tiết
          </span>

          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground'>
            <HiOutlineChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
