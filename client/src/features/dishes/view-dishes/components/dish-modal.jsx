import { HiFire, HiPlus } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';

import { useUpdateScheduleMeals } from '~/features/schedule/update-schedule/api/update-schedule';

import { useDishes } from '../api/view-dishes';

export default function DishModal({
  open,
  onClose,
  mealType,
  scheduleId,
  scheduleMeals
}) {
  const { data } = useDishes();
  const dishes = data?.docs || [];
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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-background/80 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 w-full max-w-lg rounded-[32px] bg-card border border-border shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between p-6 border-b border-border/50 bg-muted/20'>
          <div>
            <h3 className='text-xl font-black'>Thêm món ăn</h3>
            <p className='mt-0.5 text-[11px] font-bold uppercase tracking-widest text-primary'>
              {mealType}
            </p>
          </div>

          <button
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-transparent hover:border-border hover:bg-background transition'
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className='max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar'>
          {dishes.map(dish => {
            const calories =
              dish.ingredients?.[0]?.nutrients?.calories?.value ?? 0;
            const totalTime =
              (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

            return (
              <div
                key={dish._id}
                className='group flex items-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-3 transition-all
                           hover:border-primary/40 hover:bg-card hover:shadow-md'
              >
                <div className='h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border'>
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='mb-1 flex flex-wrap gap-1'>
                    {dish.categories?.map((cat, idx) => (
                      <span
                        key={idx}
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
                    <span className='flex items-center gap-1 font-black text-destructive'>
                      <HiFire size={14} />
                      {calories} kcal
                    </span>
                    <span className='h-1 w-1 rounded-full bg-border' />
                    <span className='text-muted-foreground'>
                      {totalTime} phút
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddDish(dish)}
                  className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground
                             shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'
                >
                  <HiPlus size={20} />
                </button>
              </div>
            );
          })}
        </div>

        <div className='border-t border-border/50 bg-muted/10 p-4 text-center'>
          <p className='text-[10px] italic font-medium text-muted-foreground'>
            Mẹo: Ưu tiên món giàu protein để no lâu và đủ năng lượng
          </p>
        </div>
      </div>
    </div>
  );
}
