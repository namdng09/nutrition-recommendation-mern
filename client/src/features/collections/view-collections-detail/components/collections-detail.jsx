import React from 'react';
import {
  FaArrowLeft,
  FaChevronRight,
  FaFireAlt,
  FaLock,
  FaLockOpen,
  FaTag,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link, useParams } from 'react-router';

import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';

import CollectionFavoriteButton from '../../add-collection-to-favorite/components/collection-favorite-button';
import { useCollectionDetail } from '../api/view-collections-detail';

export default function CollectionDetail() {
  const { id } = useParams();
  const { data: collection } = useCollectionDetail(id);

  if (!collection)
    return (
      <div className='flex h-64 items-center justify-center text-muted-foreground animate-pulse'>
        Đang tải bộ sưu tập...
      </div>
    );

  return (
    <div className='mx-auto w-full max-w-6xl animate-in space-y-10 px-4 pb-20 pt-6 fade-in slide-in-from-bottom-4 duration-700'>
      <Link
        to='/collections'
        className='group inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm font-bold tracking-[0.14em] text-muted-foreground transition-all hover:bg-sky-50 hover:text-sky-600'
      >
        <FaArrowLeft className='transition-transform duration-300 group-hover:-translate-x-1' />
        QUAY LẠI BỘ SƯU TẬP
      </Link>

      <div className='relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500/[0.08] via-background to-background p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)] ring-1 ring-border/50 md:p-10'>
        <div className='absolute -right-14 -top-14 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl' />
        <div className='absolute -bottom-16 left-0 h-36 w-36 rounded-full bg-sky-400/10 blur-3xl' />

        <div className='relative flex flex-wrap items-start justify-between gap-8'>
          <div className='max-w-3xl space-y-6'>
            <div className='space-y-3'>
              <h1 className='text-4xl font-black tracking-tight text-foreground md:text-5xl'>
                {collection.name}
              </h1>

              {collection.description && (
                <p className='text-base italic leading-relaxed text-muted-foreground/90 md:text-lg'>
                  "{collection.description}"
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <StatBadge
                icon={<FaUser size={12} />}
                value={collection.user?.name}
                theme='gray'
              />
              <StatBadge
                icon={<FaFireAlt size={12} />}
                value={`${collection.dishes.length} món ăn`}
                theme='orange'
              />
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-sm ${
                collection.isPublic
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-zinc-800 text-zinc-100 shadow-zinc-200'
              }`}
            >
              {collection.isPublic ? <FaLockOpen /> : <FaLock />}
              {collection.isPublic ? 'Công Khai' : 'Riêng Tư'}
            </span>

            <CollectionFavoriteButton collectionId={collection._id} />
          </div>
        </div>

        {collection.tags?.length > 0 && (
          <div className='mt-8 flex flex-wrap gap-2'>
            {collection.tags.map(tag => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 rounded-full bg-background px-3.5 py-1.5 text-[11px] font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 transition-all hover:bg-sky-50'
              >
                <FaTag className='h-3 w-3 opacity-60' />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className='space-y-6'>
        <div className='flex flex-col gap-4 rounded-[2rem] bg-card p-5 shadow-sm ring-1 ring-border/50 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg'>
              <FaUtensils size={18} />
            </div>

            <div>
              <h2 className='text-2xl font-black tracking-tight text-foreground'>
                Danh sách món ăn
              </h2>
              <p className='text-sm text-muted-foreground'>
                Những món nổi bật trong bộ sưu tập này
              </p>
            </div>
          </div>

          <div className='inline-flex w-fit items-center rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-muted-foreground'>
            {collection.dishes.length} mục
          </div>
        </div>

        {!collection.dishes.length && (
          <div className='flex flex-col items-center justify-center rounded-[2rem] bg-muted/20 py-16 text-center ring-1 ring-border/40'>
            <FaUtensils className='mb-4 text-3xl text-muted-foreground/30' />
            <p className='font-medium text-muted-foreground'>
              Chưa có món ăn nào trong bộ sưu tập này
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
          {collection.dishes.map(dish => (
            <Link
              key={dish._id}
              to={`/dishes/${dish.dishId}`}
              className='group flex items-center gap-4 rounded-[1.75rem] bg-card p-4 shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(16,185,129,0.10)] hover:ring-emerald-200'
            >
              <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted'>
                <img
                  src={dish.image}
                  alt={dish.name}
                  className='h-full w-full object-cover transition-transform duration-700'
                />
              </div>

              <div className='min-w-0 flex-1 space-y-2'>
                <h3 className='truncate text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-emerald-600'>
                  {dish.name}
                </h3>

                <div className='flex items-center gap-3'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600'>
                    <FaFireAlt size={10} />
                    {dish.energy} kcal
                  </span>
                </div>
              </div>

              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white'>
                <FaChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
