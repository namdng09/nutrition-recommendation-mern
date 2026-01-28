import React from 'react';
import {
  FaArrowLeft,
  FaFireAlt,
  FaLock,
  FaLockOpen,
  FaTag,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link, useParams } from 'react-router';

import { useCollectionDetail } from '../api/view-collections-detail';

export default function CollectionDetail() {
  const { id } = useParams();
  const { data } = useCollectionDetail(id);
  const collection = data;
  if (!collection) return null;

  return (
    <div className='mx-auto w-full max-w-6xl space-y-10 pb-10'>
      <Link
        to='/collections'
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        <FaArrowLeft />
        Quay lại bộ sưu tập
      </Link>

      <div className='rounded-3xl border border-border bg-background p-8 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <h1 className='text-3xl font-bold tracking-tight'>
              {collection.name}
            </h1>

            {collection.description && (
              <p className='max-w-2xl text-muted-foreground leading-relaxed'>
                {collection.description}
              </p>
            )}

            <div className='flex flex-wrap items-center gap-6 text-sm text-muted-foreground'>
              <span className='inline-flex items-center gap-2'>
                <FaUser />
                {collection.user?.name}
              </span>

              <span className='inline-flex items-center gap-2'>
                <FaFireAlt className='text-orange-500' />
                {collection.dishes.length} món ăn
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
              collection.isPublic
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {collection.isPublic ? <FaLockOpen /> : <FaLock />}
            {collection.isPublic ? 'Công khai' : 'Riêng tư'}
          </span>
        </div>

        {collection.tags?.length > 0 && (
          <div className='mt-6 flex flex-wrap gap-2'>
            {collection.tags.map(tag => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200'
              >
                <FaTag className='h-3 w-3' />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className='space-y-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700'>
              <FaUtensils className='h-4 w-4' />
            </span>

            <h2 className='text-xl font-semibold text-foreground'>
              Danh sách món ăn
            </h2>
          </div>

          <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700'>
            <FaFireAlt className='h-3.5 w-3.5' />
            {collection.dishes.length} món
          </span>
        </div>

        {!collection.dishes.length && (
          <div className='rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground'>
            Chưa có món ăn nào trong bộ sưu tập
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {collection.dishes.map(dish => (
            <div
              key={dish._id}
              className='group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              <img
                src={dish.image}
                alt={dish.name}
                className='h-20 w-20 shrink-0 rounded-xl object-cover'
              />

              <div className='min-w-0 flex-1'>
                <h3 className='truncate text-base font-semibold'>
                  {dish.name}
                </h3>

                <div className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
                  <FaFireAlt className='text-orange-500' />
                  {dish.calories} kcal
                </div>
              </div>

              <Link
                to={`/dishes/${dish.dishId}`}
                className='shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10'
              >
                Xem →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
