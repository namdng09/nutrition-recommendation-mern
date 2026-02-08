import React, { useState } from 'react';
import {
  FaChevronRight,
  FaClock,
  FaFireAlt,
  FaListUl,
  FaTag,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link } from 'react-router';

import { useDishes } from '../api/view-dishes';
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
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200'>
              <FaUtensils className='text-xl text-white' />
            </div>
            <h2 className='text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
              Danh sách <span className='text-emerald-600'>món ăn</span>
            </h2>
          </div>
          <p className='text-muted-foreground font-medium'>
            Khám phá {data?.totalDocs || 0} công thức nấu ăn ngon mỗi ngày từ
            cộng đồng
          </p>
        </div>

        <div className='hidden md:block'>
          <span className='inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground'>
            <FaListUl className='text-emerald-600' />
            {data?.totalDocs || 0} món ăn khả dụng
          </span>
        </div>
      </div>

      {!dishes.length && (
        <div className='flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border bg-muted/20 py-20 text-center'>
          <div className='mb-4 rounded-full bg-background p-6 shadow-sm'>
            <FaUtensils className='text-4xl text-muted-foreground/40' />
          </div>
          <h3 className='text-xl font-bold'>Chưa có món ăn nào</h3>
          <p className='text-muted-foreground'>
            Hãy là người đầu tiên chia sẻ công thức của bạn!
          </p>
        </div>
      )}

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
                  value={`${dish.ingredients?.[0]?.nutrients?.calories?.value ?? '--'} kcal`}
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
