import React, { Suspense } from 'react';

import ScheduleDayContent from '~/features/schedule/view-schedule/components/schedule-day-content';
import ScheduleTodaySkeleton from '~/features/schedule/view-schedule/components/schedule-today-skeleton';

function page() {
  return (
    <div>
      <Suspense fallback={<ScheduleTodaySkeleton />}>
        <ScheduleDayContent />
      </Suspense>
    </div>
  );
}

export default page;
