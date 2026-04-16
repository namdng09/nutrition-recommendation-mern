import { useMemo, useState } from 'react';
import {
  HiAdjustmentsHorizontal,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { useUpdateScheduleMeals } from '~/features/schedule/update-schedule/api/update-schedule';

import { useDishes } from '../api/view-dishes';
import DishFilterPanel from './dish-filter-panel';
import DishSelectionGrid from './dish-selection-grid';

export default function DishModal({
  open,
  onClose,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const user = useSelector(state => state.auth.user);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    categories: [],
    nutritionFocus: ''
  });

  const [draftFilters, setDraftFilters] = useState({
    name: '',
    categories: [],
    nutritionFocus: ''
  });

  const dishQuery = useMemo(
    () => ({
      limit: 1000,
      ...(appliedFilters.name.trim()
        ? { name: appliedFilters.name.trim() }
        : {}),
      ...(appliedFilters.categories.length
        ? { categories: appliedFilters.categories.join(',') }
        : {}),
      ...(appliedFilters.nutritionFocus
        ? { nutritionFocus: appliedFilters.nutritionFocus }
        : {})
    }),
    [appliedFilters]
  );

  const { data } = useDishes(dishQuery);

  const dishes = useMemo(() => {
    const docs = data?.docs || [];
    const currentUserId = user?.id;

    return docs.filter(dish => {
      if (dish.isPublic === true) return true;

      return (
        dish.isPublic === false &&
        currentUserId &&
        String(dish.user?._id) === String(currentUserId)
      );
    });
  }, [data?.docs, user?.id]);

  const updateMealsMutation = useUpdateScheduleMeals();

  if (!open) return null;

  const buildDishPayload = dishes =>
    dishes.map(d => ({
      dishId: d.dishId || d._id,
      servings: d.servings ?? 1
    }));

  const handleAddDish = dish => {
    const updatedMeals = scheduleMeals.map(meal => {
      if (meal.mealType !== mealType) {
        return {
          mealType: meal.mealType,
          dishes: buildDishPayload(meal.dishes)
        };
      }

      const existed = meal.dishes.find(d => (d.dishId || d._id) === dish._id);

      if (existed) {
        return {
          mealType: meal.mealType,
          dishes: meal.dishes.map(d => ({
            dishId: d.dishId || d._id,
            servings:
              (d.servings ?? 1) + ((d.dishId || d._id) === dish._id ? 1 : 0)
          }))
        };
      }

      return {
        mealType: meal.mealType,
        dishes: [
          ...buildDishPayload(meal.dishes),
          { dishId: dish._id, servings: 1 }
        ]
      };
    });

    updateMealsMutation.mutate({ scheduleId, meals: updatedMeals });
    onClose();
  };

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(prev => !prev);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleResetDraftFilters = () => {
    setDraftFilters({
      name: '',
      categories: [],
      nutritionFocus: ''
    });
  };

  const toggleCategory = categoryValue => {
    setDraftFilters(prev => {
      const exists = prev.categories.includes(categoryValue);

      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(item => item !== categoryValue)
          : [...prev.categories, categoryValue]
      };
    });
  };

  const hasAppliedFilters =
    appliedFilters.name ||
    appliedFilters.categories.length > 0 ||
    appliedFilters.nutritionFocus;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-background/80 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border/50 bg-muted/20 p-6'>
          <div>
            <h3 className='text-xl font-black'>Thêm món ăn</h3>
            <p className='mt-0.5 text-[11px] font-bold uppercase tracking-widest text-primary'>
              {mealType}
            </p>
          </div>

          <button
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition hover:border-border hover:bg-background'
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className='flex items-center gap-3 px-4 py-4'>
          <button
            type='button'
            onClick={handleOpenFilters}
            className='inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:bg-accent'
          >
            <HiAdjustmentsHorizontal size={18} />
            Bộ lọc
            {isFilterOpen ? (
              <HiChevronUp size={16} />
            ) : (
              <HiChevronDown size={16} />
            )}
          </button>

          <span className='text-sm font-medium text-primary/70'>
            {dishes.length} món ăn
          </span>
        </div>

        <DishFilterPanel
          isFilterOpen={isFilterOpen}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          toggleCategory={toggleCategory}
          handleResetDraftFilters={handleResetDraftFilters}
          handleApplyFilters={handleApplyFilters}
        />

        {hasAppliedFilters ? (
          <div className='flex flex-wrap gap-2 border-b border-border/50 bg-background/60 px-4 py-3'>
            {appliedFilters.name ? (
              <span className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
                Tên: {appliedFilters.name}
              </span>
            ) : null}

            {appliedFilters.categories.map(category => (
              <span
                key={category}
                className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'
              >
                Danh mục: {category}
              </span>
            ))}

            {appliedFilters.nutritionFocus ? (
              <span className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
                Dinh dưỡng: {appliedFilters.nutritionFocus}
              </span>
            ) : null}
          </div>
        ) : null}

        <DishSelectionGrid
          dishes={dishes}
          isFilterOpen={isFilterOpen}
          handleAddDish={handleAddDish}
        />

        <div className='border-t border-border/50 bg-muted/10 p-4 text-center'>
          <p className='text-[10px] italic font-medium text-muted-foreground'>
            Mẹo: Ưu tiên món giàu protein để no lâu và đủ năng lượng
          </p>
        </div>
      </div>
    </div>
  );
}
