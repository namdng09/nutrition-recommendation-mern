import { HiCheck } from 'react-icons/hi';

import { useUpdateDishStatus } from '../api/update-dish-status';

export default function DishCheckin({ scheduleId, mealType, dish }) {
  const { mutate } = useUpdateDishStatus();

  const handleToggle = () => {
    mutate({
      scheduleId,
      mealType,
      dishId: dish.dishId
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex h-9 w-9 items-center justify-center
        rounded-xl border-2
        transition-all
        ${
          dish.isEaten
            ? 'bg-primary border-primary text-white'
            : 'border-border bg-background hover:border-primary/50'
        }
      `}
      title='Đánh dấu đã ăn'
    >
      {dish.isEaten && <HiCheck size={18} />}
    </button>
  );
}
