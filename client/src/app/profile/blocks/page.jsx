import { Suspense } from 'react';

import { ViewBlocks } from '~/features/users/view-block/view-blocks';
import { ViewBlocksSkeleton } from '~/features/users/view-block/view-blocks-skeleton';
const Page = () => {
  return (
    <Suspense fallback={<ViewBlocksSkeleton />}>
      <ViewBlocks />
    </Suspense>
  );
};

export default Page;
