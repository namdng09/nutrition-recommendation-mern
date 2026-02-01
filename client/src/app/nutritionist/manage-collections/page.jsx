import { Suspense } from 'react';

import CollectionsFilter from '~/features/collections/view-collections/components/nutritionist/collections-filter';
import CollectionsTable from '~/features/collections/view-collections/components/nutritionist/collections-table';
import CollectionsTableSkeleton from '~/features/collections/view-collections/components/nutritionist/collections-table-skeleton';
const Page = () => {
  return (
    <div className='space-y-4'>
      <CollectionsFilter />
      <Suspense fallback={<CollectionsTableSkeleton />}>
        <CollectionsTable />
      </Suspense>
    </div>
  );
};

export default Page;
