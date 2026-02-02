import { Suspense } from 'react';

import UpdateScheduleSettings from '~/features/users/update-schedule-settings/components/update-schedule-settings';
import UpdateScheduleSettingsSkeleton from '~/features/users/update-schedule-settings/components/update-schedule-settings-skeleton';

const Page = () => {
  return (
    <Suspense fallback={<UpdateScheduleSettingsSkeleton />}>
      <UpdateScheduleSettings />
    </Suspense>
  );
};

export default Page;
