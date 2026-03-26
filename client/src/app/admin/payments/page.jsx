import { Suspense } from 'react';

import { Skeleton } from '~/components/ui/skeleton';
import ViewPayments from '~/features/payment/admin/components/view-payments';

const PaymentsTableSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className='h-10 w-full' />
        ))}
      </div>
      <div className='rounded-md border p-4 space-y-3'>
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className='h-10 w-full' />
        ))}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<PaymentsTableSkeleton />}>
      <ViewPayments />
    </Suspense>
  );
};

export default Page;
