import { Suspense } from 'react';
import { useParams } from 'react-router';

import UserDetail from '~/features/users/view-user-detail/components/admin/user-detail';
import UserDetailSkeleton from '~/features/users/view-user-detail/components/admin/user-detail-skeleton';

const Page = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<UserDetailSkeleton />}>
        <UserDetail id={id} />
      </Suspense>
    </div>
  );
};

export default Page;
