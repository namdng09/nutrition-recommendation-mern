import React, { Suspense } from 'react';

import ScheduleWeekContent from '~/features/schedule/view-schedule/components/schedule-week-content';
import ScheduleWeekSkeleton from '~/features/schedule/view-schedule/components/schedule-week-skeleton';

function page() {
  return (
    <div>
      <Suspense fallback={<ScheduleWeekSkeleton />}>
        <ScheduleWeekContent />
      </Suspense>
    </div>
  );
}

export default page;
