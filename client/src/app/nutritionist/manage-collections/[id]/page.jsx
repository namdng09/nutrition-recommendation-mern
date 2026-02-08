import { Suspense } from 'react';
import { useParams } from 'react-router';

import CollectionDetail from '~/features/collections/view-collections-detail/components/nutrition/collection-detail';
import CollectionDetailSkeleton from '~/features/collections/view-collections-detail/components/nutrition/collection-detail-skeleton';
const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<CollectionDetailSkeleton />}>
        <CollectionDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
