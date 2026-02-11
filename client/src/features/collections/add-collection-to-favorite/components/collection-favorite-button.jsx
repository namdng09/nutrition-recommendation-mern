import { Heart } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

import { useRemoveCollectionFromFavorite } from '../../remove-collection-to-favorite/api/remove-collection-to-favorite';
import { useAddCollectionToFavorite } from '../api/add-collection-to-favorite';

export default function CollectionFavoriteButton({ collectionId }) {
  const { data: profile } = useProfile();

  const { mutate: addFav } = useAddCollectionToFavorite();
  const { mutate: removeFav } = useRemoveCollectionFromFavorite();

  const favIds = profile?.favoriteCollections || [];
  const isFav = favIds.includes(collectionId);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (isFav) removeFav(collectionId);
    else addFav(collectionId);
  };

  return (
    <Button
      onClick={handleClick}
      size='icon'
      variant='ghost'
      className='rounded-full border border-border bg-white/80 hover:bg-pink-50 transition'
    >
      <Heart
        size={18}
        className={
          isFav
            ? 'text-pink-500 fill-pink-500 scale-110 transition'
            : 'text-pink-500 fill-none transition'
        }
      />
    </Button>
  );
}
