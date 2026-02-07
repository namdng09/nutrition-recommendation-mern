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
    <div className='mx-auto w-full max-w-6xl space-y-12 pb-20 pt-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <Link
        to='/collections'
        className='group inline-flex items-center gap-2 text-sm font-bold tracking-widest text-muted-foreground transition-colors hover:text-sky-600'
      >
        <FaArrowLeft className='transition-transform group-hover:-translate-x-1' />
        QUAY LẠI BỘ SƯU TẬP
      </Link>

      <div className='relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-background via-background to-sky-50/30 p-8 md:p-12 shadow-sm'>
        <div className='relative flex flex-wrap items-start justify-between gap-8'>
          <div className='max-w-3xl space-y-6'>
            <div className='space-y-2'>
              <h1 className='text-4xl font-extrabold tracking-tight text-foreground md:text-5xl'>
                {collection.name}
              </h1>
              {collection.description && (
                <p className='text-lg leading-relaxed text-muted-foreground/90 font-light italic'>
                  "{collection.description}"
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-4'>
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

          <span
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest shadow-sm ${
              collection.isPublic
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-zinc-800 text-zinc-100 shadow-zinc-200'
            }`}
          >
            {collection.isPublic ? <FaLockOpen /> : <FaLock />}
            {collection.isPublic ? 'Công Khai' : 'Riêng Tư'}
          </span>
        </div>

        {collection.tags?.length > 0 && (
          <div className='mt-10 flex flex-wrap gap-2'>
            {collection.tags.map(tag => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 transition-hover hover:bg-sky-50'
              >
                <FaTag className='h-3 w-3 opacity-60' />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className='space-y-8'>
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100'>
              <FaUtensils size={18} />
            </div>
            <h2 className='text-2xl font-bold tracking-tight text-foreground'>
              Danh sách món ăn
            </h2>
          </div>

          <div className='text-sm font-bold text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full'>
            {collection.dishes.length} mục
          </div>
        </div>

        {!collection.dishes.length && (
          <div className='flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border bg-muted/20 py-16 text-center'>
            <FaUtensils className='mb-4 text-3xl text-muted-foreground/30' />
            <p className='text-muted-foreground font-medium'>
              Chưa có món ăn nào trong bộ sưu tập này
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {collection.dishes.map(dish => (
            <Link
              key={dish._id}
              to={`/dishes/${dish.dishId}`}
              className='group flex items-center gap-5 rounded-[1.5rem] border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5'
            >
              <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl'>
                <img
                  src={dish.image}
                  alt={dish.name}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
              </div>

              <div className='min-w-0 flex-1 space-y-2'>
                <h3 className='truncate text-lg font-bold text-foreground transition-colors group-hover:text-emerald-600'>
                  {dish.name}
                </h3>

                <div className='flex items-center gap-3'>
                  <span className='inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md'>
                    <FaFireAlt size={10} />
                    {dish.calories} kcal
                  </span>
                </div>
              </div>

              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-[-45deg]'>
                <FaChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
