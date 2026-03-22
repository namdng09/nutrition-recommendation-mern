import React from 'react';
import {
  HiOutlineChevronRight,
  HiOutlineFire,
  HiOutlineTag
} from 'react-icons/hi';
import { Link } from 'react-router';

import { findByLabel, formatValue } from '~/lib/utils';

export default function IngredientRelatedCard({ ingredient }) {
  const nutrientList = ingredient?.nutrition?.nutrients || [];
  const calories = findByLabel(nutrientList, 'Năng lượng');
  const firstCategory = ingredient?.categories?.[0];

  return (
    <Link
      to={`/ingredients/${ingredient._id}`}
      className='group min-w-[300px] max-w-[300px] overflow-hidden rounded-[28px] bg-card shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/60 transition-all duration-300 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]'
    >
      <div className='relative h-48 w-full overflow-hidden bg-muted'>
        <img
          src={ingredient?.image}
          alt={ingredient?.name}
          loading='lazy'
          decoding='async'
          className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
        />

        <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent' />

        {firstCategory ? (
          <div className='absolute left-4 top-4'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-foreground shadow-sm backdrop-blur'>
              <HiOutlineTag size={12} className='text-primary' />
              {firstCategory}
            </span>
          </div>
        ) : null}
      </div>

      <div className='space-y-4 p-5'>
        <div className='space-y-2'>
          <h3 className='line-clamp-2 text-lg font-black leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary'>
            {ingredient?.name}
          </h3>

          {ingredient?.description ? (
            <p className='line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
              {ingredient.description}
            </p>
          ) : null}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {calories ? (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'>
              <HiOutlineFire size={12} />
              {formatValue(calories?.value, calories?.unit)} {calories?.unit}
            </span>
          ) : null}
        </div>

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
