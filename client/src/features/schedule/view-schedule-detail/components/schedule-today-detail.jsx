import { findByLabel } from '~/lib/utils';

import { useScheduleDetail } from '../api/view-schedule-detail';
import ScheduleNutritionPie from './schedule-nutrition-pie';
import ScheduleOverviewCard from './schedule-overview-card';

export default function ScheduleTodayDetail({ scheduleId }) {
  const { data: schedule } = useScheduleDetail(scheduleId);
  const totalCalories =
    findByLabel(schedule?.totalNutrition?.nutrients, 'Năng lượng')?.value ?? 0;

  return (
    <div className='space-y-8 p-1'>
      <ScheduleOverviewCard schedule={schedule} totalCalories={totalCalories} />

      <div className='rounded-3xl '>
        <ScheduleNutritionPie schedule={schedule} />
      </div>
    </div>
  );
}
