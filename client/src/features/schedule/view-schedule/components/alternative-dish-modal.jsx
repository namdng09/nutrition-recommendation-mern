import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { HiFire, HiPlus, HiSparkles } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';

import { useDishes } from '~/features/dishes/view-dishes/api/view-dishes';
import { useUpdateScheduleMeals } from '~/features/schedule/update-schedule/api/update-schedule';
import { QUERY_KEYS } from '~/lib/query-keys';

import { useDeleteDishSchedule } from '../../delete-dish-schedule/api/delete-dish-schedule';

export default function AlternativeDishModal({
  open,
  onClose,
  mealType,
  scheduleId,
  scheduleMeals,
  baseDish
}) {
  const queryClient = useQueryClient();
  const [isReplacing, setIsReplacing] = useState(false);

  const { data } = useDishes({ limit: 1000 });
  const dishes = data?.docs || [];

  const updateMealsMutation = useUpdateScheduleMeals();
  const { mutate: deleteDishSchedule } = useDeleteDishSchedule();

  const fullBaseDish = useMemo(() => {
    if (!baseDish) return null;

    return dishes.find(
      dish =>
        String(dish._id) === String(baseDish.dishId) ||
        String(dish._id) === String(baseDish._id) ||
        String(dish.dishId) === String(baseDish.dishId)
    );
  }, [baseDish, dishes]);

  const relatedDishes = useMemo(() => {
    if (!baseDish || !fullBaseDish) return [];

    const baseCategories = (fullBaseDish.categories || []).slice(0, 2);
    const baseNutritionFocus = fullBaseDish.nutritionFocus || [];

    const currentMeal = scheduleMeals.find(meal => meal.mealType === mealType);
    const currentDishIds = (currentMeal?.dishes || []).map(d =>
      String(d.dishId || d._id)
    );

    return dishes
      .map(dish => {
        if (!dish?._id) return null;

        const dishId = String(dish._id);
        const baseDishId = String(baseDish.dishId || baseDish._id);

        if (dishId === baseDishId) return null;

        const matchedCategories = (dish.categories || []).filter(cat =>
          baseCategories.includes(cat)
        );

        const matchedNutritionFocus = (dish.nutritionFocus || []).filter(
          focus => baseNutritionFocus.includes(focus)
        );

        const hasCategoryMatch = matchedCategories.length > 0;
        const hasNutritionMatch = matchedNutritionFocus.length > 0;

        const isRelevant =
          baseCategories.length > 0 ? hasCategoryMatch : hasNutritionMatch;

        if (!isRelevant) return null;

        const isAlreadyInMeal = currentDishIds.includes(dishId);
        if (isAlreadyInMeal) return null;

        const score =
          matchedCategories.length * 10 + matchedNutritionFocus.length * 3;

        return {
          ...dish,
          _relatedScore: score
        };
      })
      .filter(Boolean)
      .sort((a, b) => b._relatedScore - a._relatedScore)
      .slice(0, 12);
  }, [baseDish, fullBaseDish, dishes, mealType, scheduleMeals]);

  if (!open || !baseDish) return null;

  const normalizeMealDishes = mealDishes =>
    (mealDishes || []).map(d => ({
      dishId: d.dishId || d._id,
      servings: d.servings ?? 1
    }));

  const buildUpdatedMealsForReplace = dish => {
    const baseDishId = String(baseDish.dishId || baseDish._id);
    const newDishId = String(dish._id);

    return scheduleMeals.map(meal => {
      const normalizedDishes = normalizeMealDishes(meal.dishes);

      if (meal.mealType !== mealType) {
        return {
          mealType: meal.mealType,
          dishes: normalizedDishes
        };
      }

      const baseIndex = normalizedDishes.findIndex(
        d => String(d.dishId) === baseDishId
      );

      if (baseIndex === -1) {
        return {
          mealType: meal.mealType,
          dishes: normalizedDishes
        };
      }

      const baseServings = normalizedDishes[baseIndex]?.servings ?? 1;

      const withoutOldAndNew = normalizedDishes.filter(d => {
        const id = String(d.dishId);
        return id !== baseDishId && id !== newDishId;
      });

      const insertIndex = Math.min(baseIndex, withoutOldAndNew.length);

      withoutOldAndNew.splice(insertIndex, 0, {
        dishId: dish._id,
        servings: baseServings
      });

      return {
        mealType: meal.mealType,
        dishes: withoutOldAndNew
      };
    });
  };

  const patchScheduleCaches = updatedMeals => {
    queryClient.setQueryData(QUERY_KEYS.SCHEDULE(scheduleId), old => {
      if (!old) return old;
      return {
        ...old,
        meals: updatedMeals
      };
    });

    queryClient.setQueriesData({ queryKey: QUERY_KEYS.SCHEDULES }, old => {
      if (!old) return old;

      if (Array.isArray(old)) {
        return old.map(item =>
          item?._id === scheduleId ? { ...item, meals: updatedMeals } : item
        );
      }

      const oldDocs = Array.isArray(old?.docs) ? old.docs : [];

      return {
        ...old,
        docs: oldDocs.map(item =>
          item?._id === scheduleId ? { ...item, meals: updatedMeals } : item
        )
      };
    });
  };

  const rollbackScheduleCaches = (previousSchedule, previousSchedules) => {
    queryClient.setQueryData(QUERY_KEYS.SCHEDULE(scheduleId), previousSchedule);
    queryClient.setQueriesData(
      { queryKey: QUERY_KEYS.SCHEDULES },
      previousSchedules
    );
  };

  const handleReplaceDish = dish => {
    if (isReplacing) return;

    setIsReplacing(true);

    const baseDishId = String(baseDish.dishId || baseDish._id);
    const updatedMeals = buildUpdatedMealsForReplace(dish);

    const previousSchedule = queryClient.getQueryData(
      QUERY_KEYS.SCHEDULE(scheduleId)
    );
    const previousSchedules = queryClient.getQueriesData({
      queryKey: QUERY_KEYS.SCHEDULES
    });
    const schedulesSnapshot = previousSchedules?.[0]?.[1];

    patchScheduleCaches(updatedMeals);
    onClose();

    deleteDishSchedule(
      {
        scheduleId,
        mealType,
        dishId: baseDishId
      },
      {
        onSuccess: () => {
          updateMealsMutation.mutate(
            {
              scheduleId,
              meals: updatedMeals
            },
            {
              onSettled: () => {
                setIsReplacing(false);
              },
              onError: () => {
                rollbackScheduleCaches(previousSchedule, schedulesSnapshot);
              }
            }
          );
        },
        onError: () => {
          rollbackScheduleCaches(previousSchedule, schedulesSnapshot);
          setIsReplacing(false);
        }
      }
    );
  };

  const headerCategories = (fullBaseDish?.categories || []).slice(0, 2);
  const headerNutritionFocus = fullBaseDish?.nutritionFocus || [];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-background/80 backdrop-blur-sm'
        onClick={isReplacing ? undefined : onClose}
      />

      <div className='relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border/50 bg-muted/20 p-6'>
          <div>
            <h3 className='text-xl font-black'>Món ăn liên quan</h3>
            <p className='mt-0.5 text-[11px] font-bold uppercase tracking-widest text-primary'>
              {fullBaseDish?.name || baseDish.name}
            </p>
          </div>

          <button
            onClick={isReplacing ? undefined : onClose}
            disabled={isReplacing}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition hover:border-border hover:bg-background disabled:cursor-not-allowed disabled:opacity-50'
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className='border-b border-border/50 bg-background/60 px-4 py-3'>
          <div className='flex flex-wrap gap-2'>
            {headerCategories.map(category => (
              <span
                key={category}
                className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'
              >
                {category}
              </span>
            ))}
            {headerNutritionFocus.map(focus => (
              <span
                key={focus}
                className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'
              >
                {focus}
              </span>
            ))}
          </div>
        </div>

        <div className='max-h-[500px] overflow-y-auto p-4 custom-scrollbar'>
          <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
            {relatedDishes.map(dish => {
              const calories =
                dish.nutrition?.nutrients?.find(n => n.label === 'Năng lượng')
                  ?.value ?? 0;
              const totalTime =
                (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

              return (
                <button
                  key={dish._id}
                  type='button'
                  disabled={isReplacing}
                  onClick={() => handleReplaceDish(dish)}
                  className='group flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-3 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <div className='h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                    <img
                      src={dish.image || '/logo2.png'}
                      alt={dish.name}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex flex-wrap gap-1'>
                      {(dish.categories || []).slice(0, 2).map((cat, idx) => (
                        <span
                          key={`${cat}-${idx}`}
                          className='rounded bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70'
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <h4 className='truncate text-sm font-bold text-foreground'>
                      {dish.name}
                    </h4>

                    <div className='mt-1.5 flex items-center gap-3 text-[11px]'>
                      <span className='text-muted-foreground'>
                        {totalTime} phút
                      </span>
                      <span className='h-1 w-1 rounded-full bg-border' />
                      <span className='flex items-center gap-1 font-black text-destructive'>
                        <HiFire size={14} />
                        {calories} kcal
                      </span>
                    </div>
                  </div>

                  <button
                    type='button'
                    disabled={isReplacing}
                    onClick={e => {
                      e.stopPropagation();
                      handleReplaceDish(dish);
                    }}
                    className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
                    title='Thay thế món hiện tại'
                  >
                    <HiPlus size={20} />
                  </button>
                </button>
              );
            })}

            {relatedDishes.length === 0 ? (
              <div className='col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
                {!fullBaseDish
                  ? 'Không tìm thấy dữ liệu đầy đủ của món gốc để gợi ý món liên quan'
                  : 'Không có món ăn liên quan phù hợp'}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
