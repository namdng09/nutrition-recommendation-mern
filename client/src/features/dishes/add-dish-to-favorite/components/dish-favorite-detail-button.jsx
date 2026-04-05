import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveDishFromFavorite } from '../../remove-dish-to-favorite/api/remove-dish-to-favorite';
import { useAddDishToFavorite } from '../api/add-dish-to-favorite';

export default function DishFavoriteDetailButton({ dishId, className = '' }) {
  const { data: profile } = useProfile();

  const { mutate: addFav, isPending: isAdding } = useAddDishToFavorite();
  const { mutate: removeFav, isPending: isRemoving } =
    useRemoveDishFromFavorite();

  const favoriteDishes = profile?.favoriteDishes || [];

  const favoriteDishIds = favoriteDishes.map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const isFav = favoriteDishIds.includes(dishId);
  const isLoading = isAdding || isRemoving;

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    if (isFav) removeFav(dishId);
    else addFav(dishId);
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      disabled={isLoading}
      className={`
        rounded-full border border-border bg-white/80
        backdrop-blur transition hover:bg-pink-50
        ${className}
      `}
    >
      <Heart
        size={18}
        className={`transition-all duration-200 ${
          isFav
            ? 'scale-110 fill-pink-500 text-pink-500'
            : 'fill-none text-pink-500'
        }`}
      />
    </Button>
  );
}
