import { Suspense } from 'react';

import Profile from '~/features/users/view-profile/components/profile';
import ProfileSkeleton from '~/features/users/view-profile/components/profile-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
};

export default Page;
