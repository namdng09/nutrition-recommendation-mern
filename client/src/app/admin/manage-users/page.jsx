import { Suspense } from 'react';

import UsersFilter from '~/features/users/view-users/components/admin/users-filter';
import UsersTable from '~/features/users/view-users/components/admin/users-table';
import UsersTableSkeleton from '~/features/users/view-users/components/admin/users-table-skeleton';

const Page = () => {
  return (
    <div className='space-y-4'>
      <UsersFilter />
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  );
};

export default Page;
