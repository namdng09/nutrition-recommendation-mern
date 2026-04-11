import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaChevronRight,
  FaClock,
  FaFilter,
  FaFireAlt,
  FaTimes,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link } from 'react-router';

import { getNutritionValue } from '~/lib/utils';

import DishFavoriteButton from '../../add-dish-to-favorite/components/dish-favorite-button';
import { useDishes } from '../api/view-dishes';
import DishEmpty from './dish-empty';
import DishFilters from './dish-filters';
import DishHeader from './dish-header';
import StatBadge from './dish-stat-badge';
import DishesPagination from './dishes-pagination';

const DEFAULT_FILTERS = {
  name: '',
  categories: [],
  nutritionFocus: [],
  isFavorited: false
};

export default function DishesList() {
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showMyDishes, setShowMyDishes] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const { data } = useDishes({
    page,
    limit: 6,
    isPublic: showMyDishes ? false : true,
    ...(appliedFilters.name?.trim()
      ? { name: appliedFilters.name.trim() }
      : {}),
    ...(appliedFilters.categories.length
      ? { categories: appliedFilters.categories }
      : {}),
    ...(appliedFilters.nutritionFocus.length
      ? { nutritionFocus: appliedFilters.nutritionFocus }
      : {}),
    ...(appliedFilters.isFavorited ? { isFavorited: true } : {})
  });

  const dishes = data?.docs || [];

  const handleFilterChange = (field, value) => {
    setDraftFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setPage(1);
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleToggleMyDishes = () => {
    setPage(1);
    setShowMyDishes(prev => !prev);
  };

  const activeFilterCount =
    (appliedFilters.name?.trim() ? 1 : 0) +
    appliedFilters.categories.length +
    appliedFilters.nutritionFocus.length +
    (appliedFilters.isFavorited ? 1 : 0);

  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  const filterModal =
    showFilters &&
    createPortal(
      <div
        className='fixed inset-0 z-[9999] bg-black/50'
        onClick={() => setShowFilters(false)}
      >
        <div className='flex min-h-screen items-center justify-center p-4'>
          <div
            className='relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-background shadow-2xl'
            onClick={e => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => setShowFilters(false)}
              className='absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-accent'
            >
              <FaTimes />
            </button>

            <DishFilters
              filters={draftFilters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div className='mx-auto w-full max-w-7xl animate-in space-y-8 fade-in duration-500'>
        <DishHeader total={data?.totalDocs} />

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => setShowFilters(true)}
              className='inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110'
            >
              <FaFilter size={13} />
              Bộ lọc món ăn
            </button>

            <button
              type='button'
              onClick={handleToggleMyDishes}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                showMyDishes
                  ? 'bg-orange-500 text-white hover:brightness-110'
                  : 'border border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              <FaUser className='text-xs' />
              Món ăn của tôi
            </button>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {showMyDishes ? (
              <span className='inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700'>
                Đang hiển thị món ăn bạn tạo
              </span>
            ) : (
              <span className='inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700'>
                Đang hiển thị món ăn hệ thống
              </span>
            )}

            {activeFilterCount > 0 && (
              <span className='inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>
                Đang áp dụng {activeFilterCount} bộ lọc
              </span>
            )}
          </div>
        </div>

        {!dishes?.length && <DishEmpty />}

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {dishes.map(dish => (
            <Link
              to={`/dishes/${dish._id}`}
              key={dish._id}
              className='group relative flex flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.10)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]'
            >
              <div className='relative h-60 w-full overflow-hidden bg-muted'>
                <img
                  src={dish.image || '/placeholder.png'}
                  alt={dish.name}
                  className='h-full w-full object-cover transition-transform duration-700'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent' />

                {dish.tags?.[0] && (
                  <div className='absolute left-4 top-4'>
                    <span className='inline-flex items-center rounded-full bg-background/90 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-foreground shadow-md backdrop-blur'>
                      {dish.tags[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className='flex flex-1 flex-col p-5 sm:p-6'>
                <div className='mb-4 flex items-start justify-between gap-3'>
                  <h3 className='line-clamp-2 text-[22px] font-black leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary'>
                    {dish.name}
                  </h3>

                  <div className='shrink-0'>
                    <DishFavoriteButton dishId={dish._id} />
                  </div>
                </div>

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

                <p className='mb-6 line-clamp-3 text-sm leading-6 text-muted-foreground'>
                  {dish.description ||
                    'Công thức chế biến đơn giản, ngon miệng và đầy đủ dinh dưỡng cho cả gia đình.'}
                </p>

                <div className='mt-auto flex items-center justify-between border-t border-border/60 pt-4'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                      <FaUser size={12} />
                    </div>
                    <span className='truncate text-xs font-bold text-foreground/80'>
                      {dish.user?.name}
                    </span>
                  </div>

                  <div className='flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-primary transition-all group-hover:gap-2 group-hover:bg-primary group-hover:text-primary-foreground'>
                    Chi tiết <FaChevronRight />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className='pt-8'>
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

      {filterModal}
    </>
  );
}
