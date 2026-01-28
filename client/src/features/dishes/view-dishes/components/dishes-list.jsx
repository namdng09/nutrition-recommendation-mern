import React, { useState } from 'react';
import {
  FaClock,
  FaFireAlt,
  FaListUl,
  FaTag,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link } from 'react-router';

import { useDishes } from '../api/view-dishes';
import DishesPagination from './dishes-pagination';

export default function DishesList() {
  const [page, setPage] = useState(1);
  const { data } = useDishes({
    page,
    limit: 6
  });
  const dishes = data.docs;

  return (
    <div className='mx-auto w-full max-w-7xl space-y-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h2 className='flex items-center gap-2 text-2xl font-bold'>
            <FaUtensils className='text-emerald-600' />
            Món ăn
          </h2>
          <p className='text-sm text-muted-foreground'>
            Danh sách các món ăn được chia sẻ
          </p>
        </div>

        <span className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200'>
          <FaListUl />
          {data.totalDocs} món
        </span>
      </div>

      {!dishes.length && (
        <div className='rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground'>
          Chưa có món ăn nào
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {dishes.map(dish => (
          <Link to={`/dishes/${dish._id}`}>
            <div
              key={dish._id}
              className='group rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'
            >
              <img
                src={dish.image}
                alt={dish.name}
                className='h-44 w-full rounded-t-2xl object-cover'
              />

              <div className='p-4 space-y-3'>
                <h3 className='truncate text-lg font-semibold'>{dish.name}</h3>

                <div className='mt-3 flex flex-wrap items-center gap-3 text-sm'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700 ring-1 ring-orange-200'>
                    <FaFireAlt className='text-orange-500' />
                    {dish.ingredients?.[0]?.nutrients?.calories?.value ??
                      '--'}{' '}
                    kcal
                  </span>

                  <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200'>
                    <FaClock className='text-emerald-600' />
                    {dish.preparationTime + dish.cookTime} phút
                  </span>

                  <span className='inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-sky-200'>
                    <FaUtensils className='text-sky-600' />
                    {dish.servings} người
                  </span>
                </div>

                {dish.tags?.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {dish.tags.map(tag => (
                      <span
                        key={tag}
                        className='inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200'
                      >
                        <FaTag className='h-3 w-3' />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className='flex items-center justify-between pt-2'>
                  <span className='inline-flex items-center gap-1 text-sm text-muted-foreground'>
                    <FaUser />
                    {dish.user?.name}
                  </span>

                  <Link
                    to={`/dishes/${dish._id}`}
                    className='text-sm font-medium text-primary hover:underline'
                  >
                    Xem →
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <DishesPagination
        page={data.page}
        totalPages={data.totalPages}
        hasPrevPage={data.hasPrevPage}
        hasNextPage={data.hasNextPage}
        onPrev={() => setPage(p => Math.max(1, p - 1))}
        onNext={() => setPage(p => p + 1)}
      />
    </div>
  );
}
