import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveCollectionFromFavorite } from '../../remove-collection-to-favorite/api/remove-collection-to-favorite';
import { useAddCollectionToFavorite } from '../api/add-collection-to-favorite';

export default function CollectionFavoriteButton({ collectionId }) {
  const { data: profile } = useProfile();

  const { mutate: addFav, isPending: isAdding } = useAddCollectionToFavorite();
  const { mutate: removeFav, isPending: isRemoving } =
    useRemoveCollectionFromFavorite();

  const favoriteCollections = profile?.favoriteCollections || [];

  const favoriteCollectionIds = favoriteCollections.map(item =>
    typeof item === 'string' ? item : item?._id
  );

  const isFav = favoriteCollectionIds.includes(collectionId);
  const isLoading = isAdding || isRemoving;

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    if (isFav) removeFav(collectionId);
    else addFav(collectionId);
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      disabled={isLoading}
      className='rounded-full border border-border bg-white/80 transition hover:bg-pink-50'
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
