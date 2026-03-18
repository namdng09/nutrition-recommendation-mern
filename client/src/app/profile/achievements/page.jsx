// page.jsx (in app/profile/achievements/)
import { Suspense } from 'react';

import { AchievementsList } from '~/features/users/view-achievements/components/achievements-list';
import { AchievementsListSkeleton } from '~/features/users/view-achievements/components/achievements-list-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<AchievementsListSkeleton />}>
      <AchievementsList />
    </Suspense>
  );
};

export default Page;
