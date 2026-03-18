import { format, isSameDay, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';

import { useRecommendDailyMeals } from '~/features/ai-schedule/recommend-ai-meal/api/recommend-daily-meals';

import AddWorkoutModal from '../../add-exercise-workout/components/add-workout-modal';
import { useCreateSchedule } from '../../create-schedule/api/create-schedule';
import EditWorkoutModal from '../../update-exercise-workout/components/edit-workout-modal';
import { useUpdateScheduleMeals } from '../../update-schedule/api/update-schedule';
import ScheduleTodayDetail from '../../view-schedule-detail/components/schedule-today-detail';
import { useSchedules } from '../api/view-schedule';
import ScheduleEmptyState from './schedule-empty-state';
import ScheduleTodayCard from './schedule-today-card';
import ScheduleTodayWorkout from './workout/schedule-today-workout';

export default function ScheduleToday({ selectedDate = new Date() }) {
  const { data } = useSchedules({ limit: 1000 });

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateScheduleMeals } = useUpdateScheduleMeals();

  const { mutate: generateAI, isPending: isGeneratingAI } =
    useRecommendDailyMeals();

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isEditWorkoutOpen, setIsEditWorkoutOpen] = useState(false);
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);

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

  const handleOpenEditWorkout = workout => {
    setSelectedWorkout(workout);
    setIsEditWorkoutOpen(true);
  };

  const handleCloseEditWorkout = () => {
    setSelectedWorkout(null);
    setIsEditWorkoutOpen(false);
  };

  const handleOpenAddWorkout = () => {
    setIsAddWorkoutOpen(true);
  };

  const handleCloseAddWorkout = () => {
    setIsAddWorkoutOpen(false);
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
    <>
      <div className='w-full max-w-7xl mx-auto space-y-10'>
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start'>
          <div className='space-y-8 self-start lg:sticky lg:top-6'>
            <ScheduleTodayCard
              schedule={schedule}
              selectedDate={selectedDate}
              onGenerateAI={handleGenerateAI}
              isGeneratingAI={isGeneratingAI}
            />
          </div>

          <ScheduleTodayDetail scheduleId={schedule._id} />
        </div>

        <ScheduleTodayWorkout
          schedule={schedule}
          onEditWorkout={handleOpenEditWorkout}
          onAddWorkout={handleOpenAddWorkout}
        />
      </div>

      <EditWorkoutModal
        open={isEditWorkoutOpen}
        onClose={handleCloseEditWorkout}
        scheduleId={schedule._id}
        workout={selectedWorkout}
      />

      <AddWorkoutModal
        open={isAddWorkoutOpen}
        onClose={handleCloseAddWorkout}
        scheduleId={schedule._id}
        exercises={[]}
      />
    </>
  );
}
