import React, { useCallback, useMemo } from 'react';
import {
  FaChevronRight,
  FaClock,
  FaFireAlt,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router';

import { getNutritionValue } from '~/lib/utils';

import DishFavoriteButton from '../../add-dish-to-favorite/components/dish-favorite-button';
import { useDishes } from '../api/view-dishes';
import DishEmpty from './dish-empty';
import DishFilter from './dish-filter';
import DishHeader from './dish-header';
import StatBadge from './dish-stat-badge';
import DishesPagination from './dishes-pagination';

export default function DishesList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get('name') ?? '';
  const ingredient = searchParams.get('ingredient') ?? '';
  const categories = searchParams.get('categories') ?? '';
  const nutritionFocus = searchParams.get('nutritionFocus') ?? '';
  const tags = searchParams.get('tags') ?? '';
  const minServings = searchParams.get('servings[gte]') ?? '';
  const maxServings = searchParams.get('servings[lte]') ?? '';
  const maxPreparationTime = searchParams.get('preparationTime[lte]') ?? '';
  const maxCookTime = searchParams.get('cookTime[lte]') ?? '';
  const favoritesOnly = searchParams.get('favoritesOnly') === 'true';
  const includeBlocked = searchParams.get('includeBlocked') === 'true';
  const page = Number(searchParams.get('page') ?? 1);

  const params = useMemo(() => {
    const nextParams = {
      page,
      limit: 6
    };

    if (name) nextParams.name = name;
    if (ingredient) nextParams['ingredients.name'] = ingredient;
    if (categories) nextParams.categories = categories;
    if (nutritionFocus) nextParams.nutritionFocus = nutritionFocus;
    if (tags) nextParams.tags = tags;
    if (minServings) nextParams['servings[gte]'] = Number(minServings);
    if (maxServings) nextParams['servings[lte]'] = Number(maxServings);
    if (maxPreparationTime)
      nextParams['preparationTime[lte]'] = Number(maxPreparationTime);
    if (maxCookTime) nextParams['cookTime[lte]'] = Number(maxCookTime);
    if (favoritesOnly) nextParams.favoritesOnly = true;
    if (includeBlocked) nextParams.includeBlocked = true;

    return nextParams;
  }, [
    categories,
    favoritesOnly,
    includeBlocked,
    ingredient,
    maxCookTime,
    maxPreparationTime,
    maxServings,
    minServings,
    name,
    nutritionFocus,
    page,
    tags
  ]);

  const { data } = useDishes(params);
  const dishes = data?.docs || [];

  const goToPrev = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(Math.max(1, page - 1)));
      return next;
    });
  }, [page, setSearchParams]);

  const goToNext = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page + 1));
      return next;
    });
  }, [page, setSearchParams]);

  return (
    <div className='mx-auto w-full max-w-7xl animate-in space-y-8 fade-in duration-500'>
      <DishHeader total={data?.totalDocs} />

      <DishFilter />

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
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 1}
          hasPrevPage={data?.hasPrevPage}
          hasNextPage={data?.hasNextPage}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      </div>
    </div>
  );
}
