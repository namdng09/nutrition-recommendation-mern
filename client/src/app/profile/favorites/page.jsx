import { Suspense } from 'react';

import { ViewFavorites } from '~/features/users/view-favorite/components/view-favorites';
import { ViewFavoritesSkeleton } from '~/features/users/view-favorite/components/view-favorites-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<ViewFavoritesSkeleton />}>
      <ViewFavorites />
    </Suspense>
  );
};

export default Page;
