import { Ban, Loader2, Trash2, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import {
  FaChevronRight,
  FaClock,
  FaFireAlt,
  FaUser,
  FaUtensils
} from 'react-icons/fa';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import StatBadge from '~/features/dishes/view-dishes/components/dish-stat-badge';
import { useRemoveBlockDish } from '~/features/users/update-block-dish/api/update-block-dish';
import { useBlockDishes } from '~/features/users/view-block-dishes/api/view-block-dishes';
import { getNutritionValue } from '~/lib/utils';

import { ViewBlockDishesSkeleton } from './view-block-dishes-skeleton';

export function ViewBlockDishes() {
  const { data: dishes, isLoading } = useBlockDishes();
  const [removingId, setRemovingId] = useState(null);

  const { mutate: removeBlockDish } = useRemoveBlockDish({
    onMutate: dishId => {
      setRemovingId(dishId);
    },
    onSuccess: response => {
      toast.success(response?.message || 'Đã bỏ chặn món ăn');
      setRemovingId(null);
    },
    onError: error => {
      toast.error(error?.response?.data?.message || 'Bỏ chặn món ăn thất bại');
      setRemovingId(null);
    }
  });

  if (isLoading) {
    return <ViewBlockDishesSkeleton />;
  }

  if (!dishes || dishes.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Ban className='h-16 w-16 text-muted-foreground/50 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Chưa có món ăn bị chặn</h3>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Chặn món ăn để loại bỏ chúng khỏi gợi ý thực đơn
          </p>
          <Link
            to='/dishes'
            className='mt-4 text-sm font-medium text-primary hover:underline'
          >
            Khám phá món ăn →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
      {dishes.map(dish => (
        <DishBlockCard
          key={dish._id}
          dish={dish}
          onRemove={() => removeBlockDish(dish._id)}
          isRemoving={removingId === dish._id}
        />
      ))}
    </div>
  );
}

function DishBlockCard({ dish, onRemove, isRemoving }) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-destructive/20 bg-background transition-all duration-300 hover:-translate-y-2 hover:border-destructive/40 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] ${
        isRemoving ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <Link to={`/dishes/${dish._id}`} className='flex flex-col flex-1'>
        {/* Image Section */}
        <div className='relative h-60 w-full overflow-hidden'>
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110'
              loading='lazy'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-muted'>
              <UtensilsCrossed className='h-16 w-16 text-muted-foreground/30' />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className='flex flex-1 flex-col p-6'>
          <h3 className='mb-3 line-clamp-1 text-xl font-bold text-foreground transition-colors group-hover:text-destructive'>
            {dish.name}
          </h3>

          {/* Stats Badges */}
          <div className='mb-4 flex flex-wrap gap-2'>
            <StatBadge
              icon={<FaFireAlt size={12} />}
              value={`${getNutritionValue(dish, 'Năng lượng')} kcal`}
              theme='orange'
            />
            <StatBadge
              icon={<FaClock size={12} />}
              value={`${(dish.preparationTime || 0) + (dish.cookTime || 0)} phút`}
              theme='emerald'
            />
            <StatBadge
              icon={<FaUtensils size={12} />}
              value={`${dish.servings} người`}
              theme='sky'
            />
          </div>

          {/* Description */}
          <p className='mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
            {dish.description ||
              'Công thức chế biến đơn giản, ngon miệng và đầy đủ dinh dưỡng cho cả gia đình.'}
          </p>

          {/* Footer */}
          <div className='mt-auto flex items-center justify-between border-t border-border/50 pt-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground'>
                <FaUser size={12} />
              </div>
              <span className='text-xs font-semibold text-foreground/80'>
                {dish.user?.name || 'Unknown'}
              </span>
            </div>

            <div className='flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-destructive transition-all group-hover:gap-2'>
              Chi tiết <FaChevronRight />
            </div>
          </div>
        </div>
      </Link>

      {/* Unblock Button */}
      <div className='absolute top-4 right-4 z-20'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-full bg-white/90 text-emerald-600 backdrop-blur-md hover:bg-emerald-600 hover:text-white transition shadow-lg'
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Trash2 className='h-4 w-4' />
          )}
        </Button>
      </div>
    </div>
  );
}
