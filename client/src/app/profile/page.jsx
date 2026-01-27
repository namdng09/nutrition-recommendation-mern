import { Suspense } from 'react';

import Profile from '~/features/users/view-profile/components/profile';
import ProfileSkeleton from '~/features/users/view-profile/components/profile-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
    </div>
  );
};

export default Page;
