import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveIngredientFromFavorite } from '../../remove-ingredient-to-fav/api/remove-ingredient-to-favorite';
import { useAddIngredientToFavorite } from '../api/add-ingredient-to-favorite';

export default function FavoriteButton({ ingredientId }) {
  const { data: profile } = useProfile();

  const { mutate: addFav, isPending: isAdding } = useAddIngredientToFavorite();
  const { mutate: removeFav, isPending: isRemoving } =
    useRemoveIngredientFromFavorite();

  const favoriteIngredients = profile?.favoriteIngredients || [];

  const favoriteIngredientIds = favoriteIngredients.map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const isFav = favoriteIngredientIds.includes(ingredientId);
  const isLoading = isAdding || isRemoving;

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

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
      disabled={isLoading}
      className='absolute top-3 right-3 z-20 rounded-full border border-border bg-white/80 backdrop-blur transition hover:bg-pink-50'
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
