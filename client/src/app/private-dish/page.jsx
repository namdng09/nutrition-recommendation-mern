import { Suspense } from 'react';

import CreatePrivateDish from '~/features/private-dish/create-private-dish/components/create-private-dish';
import CreatePrivateDishSkeleton from '~/features/private-dish/create-private-dish/components/create-private-dish-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Suspense fallback={<CreatePrivateDishSkeleton />}>
        <CreatePrivateDish />
      </Suspense>
    </div>
  );
};

export default Page;
