import { format, isSameDay, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useRecommendDailyMeals } from '~/features/ai-schedule/recommend-ai-meal/api/recommend-daily-meals';

import { useCreateSchedule } from '../../create-schedule/api/create-schedule';
import { useUpdateScheduleMeals } from '../../update-schedule/api/update-schedule';
import ScheduleTodayDetail from '../../view-schedule-detail/components/schedule-today-detail';
import { useSchedules } from '../api/view-schedule';
import ScheduleEmptyState from './schedule-empty-state';
import ScheduleTodayCard from './schedule-today-card';

export default function ScheduleToday({ selectedDate = new Date() }) {
  const { data } = useSchedules({ limit: 1000 });

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateScheduleMeals } = useUpdateScheduleMeals();

  const { mutate: generateAI, isPending: isGeneratingAI } =
    useRecommendDailyMeals();

  const docs = Array.isArray(data?.docs) ? data.docs : [];

  const todaySchedules = docs.filter(s =>
    isSameDay(new Date(s.date), selectedDate)
  );

  const schedule = todaySchedules[0];

  const handleCreateToday = () => {
    createSchedule({
      date: startOfDay(selectedDate),
      dayOfWeek: format(selectedDate, 'EEEE', { locale: vi })
    });
  };

  const handleGenerateAI = () => {
    if (!schedule?._id) return;

    generateAI(
      { date: startOfDay(selectedDate) },
      {
        onSuccess: res => {
          const aiData = res.data;

          const formattedMeals = aiData.meals.map(meal => ({
            mealType: meal.mealType,
            notes: '',
            dishes: meal.dishes.map(dish => ({
              dishId: dish.dishId,
              servings: dish.servings ?? 1
            }))
          }));

          updateScheduleMeals({
            scheduleId: schedule._id,
            meals: formattedMeals
          });
        }
      }
    );
  };

  if (!schedule) {
    return (
      <ScheduleEmptyState
        onCreate={handleCreateToday}
        isCreating={isCreating}
      />
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10'>
      <ScheduleTodayCard
        schedule={schedule}
        selectedDate={selectedDate}
        onGenerateAI={handleGenerateAI}
        isGeneratingAI={isGeneratingAI}
      />

      <ScheduleTodayDetail scheduleId={schedule._id} />
    </div>
  );
}
