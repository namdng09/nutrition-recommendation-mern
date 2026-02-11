import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveIngredientFromFavorite } from '../../remove-ingredient-to-fav/api/remove-ingredient-to-favorite';
import { useAddIngredientToFavorite } from '../api/add-ingredient-to-favorite';

export default function FavoriteButton({ ingredientId }) {
  const { data: profile } = useProfile();

  const { mutate: addFav } = useAddIngredientToFavorite();
  const { mutate: removeFav } = useRemoveIngredientFromFavorite();

  const favIds = profile?.favoriteIngredients || [];
  const isFav = favIds.includes(ingredientId);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isFav) {
      removeFav(ingredientId);
    } else {
      addFav(ingredientId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      className='absolute top-3 right-3 z-20 rounded-full bg-white/80 backdrop-blur border border-border hover:bg-pink-50 transition'
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
