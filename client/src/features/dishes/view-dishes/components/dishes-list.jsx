import React, { useState } from 'react';
import {
  FaChevronRight,
  FaClock,
  FaFireAlt,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link } from 'react-router';

import { getNutritionValue } from '~/lib/utils';

import { useDishes } from '../api/view-dishes';
import DishEmpty from './dish-empty';
import DishHeader from './dish-header';
import StatBadge from './dish-stat-badge';
import DishesPagination from './dishes-pagination';

export default function DishesList() {
  const [page, setPage] = useState(1);
  const { data } = useDishes({
    page,
    limit: 6
  });
  const dishes = data?.docs || [];

  return (
    <div className='mx-auto w-full max-w-7xl space-y-10 animate-in fade-in duration-500'>
      <DishHeader total={data?.totalDocs} />

      {!dishes?.length && <DishEmpty />}

      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {dishes.map(dish => (
          <Link
            to={`/dishes/${dish._id}`}
            key={dish._id}
            className='group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
          >
            <div className='relative h-60 w-full overflow-hidden'>
              <img
                src={dish.image || '/placeholder.png'}
                alt={dish.name}
                className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

              {dish.tags?.[0] && (
                <div className='absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-md'>
                  {dish.tags[0]}
                </div>
              )}
            </div>

            <div className='flex flex-1 flex-col p-6'>
              <h3 className='mb-3 line-clamp-1 text-xl font-bold text-foreground transition-colors group-hover:text-emerald-600'>
                {dish.name}
              </h3>

              <div className='mb-4 flex flex-wrap gap-2'>
                <StatBadge
                  icon={<FaFireAlt size={12} />}
                  value={`${getNutritionValue(dish, 'Năng lượng')} kcal`}
                  theme='orange'
                />
                <StatBadge
                  icon={<FaClock size={12} />}
                  value={`${dish.preparationTime + dish.cookTime} phút`}
                  theme='emerald'
                />
                <StatBadge
                  icon={<FaUtensils size={12} />}
                  value={`${dish.servings} người`}
                  theme='sky'
                />
              </div>

              <p className='mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
                {dish.description ||
                  'Công thức chế biến đơn giản, ngon miệng và đầy đủ dinh dưỡng cho cả gia đình.'}
              </p>

              <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground'>
                    <FaUser size={12} />
                  </div>
                  <span className='text-xs font-semibold text-foreground/80'>
                    {dish.user?.name}
                  </span>
                </div>

                <div className='flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-600 transition-all group-hover:gap-2'>
                  Chi tiết <FaChevronRight />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className='pt-10'>
        <DishesPagination
          page={data?.page}
          totalPages={data?.totalPages}
          hasPrevPage={data?.hasPrevPage}
          hasNextPage={data?.hasNextPage}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => p + 1)}
        />
      </div>
    </div>
  );
}
