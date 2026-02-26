import { Trash2, UtensilsCrossed } from 'lucide-react';
import { useMemo } from 'react';
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
import { useRemoveFavoriteDish } from '~/features/users/update-favorite-dish/api/update-favorite-dish';
import { useBlockDishes } from '~/features/users/view-block-dishes/api/view-block-dishes';
import { useFavoriteDishes } from '~/features/users/view-favorite-dishes/api/view-favorite-dishes';
import { getNutritionValue } from '~/lib/utils';

export function ViewFavoriteDishes() {
  const { data: favoriteDishes, isLoading: isLoadingFavorites } =
    useFavoriteDishes();
  const { data: blockDishes, isLoading: isLoadingBlocks } = useBlockDishes();

  // Lọc bỏ các món ăn đã bị block
  const filteredDishes = useMemo(() => {
    if (!favoriteDishes) return [];
    if (!blockDishes || blockDishes.length === 0) return favoriteDishes;

    const blockIds = new Set(blockDishes.map(dish => dish._id));
    return favoriteDishes.filter(dish => !blockIds.has(dish._id));
  }, [favoriteDishes, blockDishes]);

  const { mutate: removeDish, isPending: isRemovingDish } =
    useRemoveFavoriteDish({
      onSuccess: response => {
        toast.success(response?.message || 'Đã xóa món ăn yêu thích');
      },
      onError: error => {
        toast.error(
          error?.response?.data?.message || 'Xóa món ăn yêu thích thất bại'
        );
      }
    });

  const isLoading = isLoadingFavorites || isLoadingBlocks;

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='h-96 rounded-[2rem] border bg-muted animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (!filteredDishes || filteredDishes.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <UtensilsCrossed className='h-16 w-16 text-muted-foreground/50 mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            Chưa có món ăn yêu thích
          </h3>
          <p className='text-sm text-muted-foreground text-center max-w-md'>
            Bắt đầu thêm món ăn vào danh sách yêu thích để dễ dàng truy cập sau
            này
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
      {filteredDishes.map(dish => (
        <div
          key={dish._id}
          className='group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-background transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
        >
          <Link to={`/dishes/${dish._id}`} className='flex flex-col flex-1'>
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
                  value={`${(dish.preparationTime || 0) + (dish.cookTime || 0)} phút`}
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
                    {dish.user?.name || 'Unknown'}
                  </span>
                </div>

                <div className='flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-600 transition-all group-hover:gap-2'>
                  Chi tiết <FaChevronRight />
                </div>
              </div>
            </div>
          </Link>

          {/* Delete Button */}
          <div className='absolute top-4 right-4 z-20'>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 rounded-full bg-white/90 text-destructive backdrop-blur-md hover:bg-destructive hover:text-white transition'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                removeDish(dish._id);
              }}
              disabled={isRemovingDish}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
