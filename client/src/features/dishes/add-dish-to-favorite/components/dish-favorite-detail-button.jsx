import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveDishFromFavorite } from '../../remove-dish-to-favorite/api/remove-dish-to-favorite';
import { useAddDishToFavorite } from '../api/add-dish-to-favorite';

export default function DishFavoriteDetailButton({ dishId, className = '' }) {
  const { data: profile } = useProfile();

  const { mutate: addFav } = useAddDishToFavorite();
  const { mutate: removeFav } = useRemoveDishFromFavorite();

  const favIds = profile?.favoriteDishes || [];
  const isFav = favIds.includes(dishId);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isFav) removeFav(dishId);
    else addFav(dishId);
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      className={`
        rounded-full
        bg-white/80 backdrop-blur
        border border-border
        hover:bg-pink-50
        transition
        ${className}
      `}
    >
      <Heart
        size={18}
        className={`
          transition-all duration-200
          ${
            isFav
              ? 'text-pink-500 fill-pink-500 scale-110'
              : 'text-pink-500 fill-none'
          }
        `}
      />
    </Button>
  );
}
