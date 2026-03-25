import React, { Suspense } from 'react';

import ScheduleNutritionContent from '~/features/schedule/view-schedule-detail/components/schedule-nutrition-content';
import ScheduleNutritionSkeleton from '~/features/schedule/view-schedule-detail/components/schedule-nutrition-skeleton';

function page() {
  return (
    <div>
      <Suspense fallback={<ScheduleNutritionSkeleton />}>
        <ScheduleNutritionContent />
      </Suspense>
    </div>
  );
}

export default page;
