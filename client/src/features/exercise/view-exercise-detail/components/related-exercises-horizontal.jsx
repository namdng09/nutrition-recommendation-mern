import React, { useMemo } from 'react';

import ExerciseRelatedCard from './exercise-related-card';

export default function RelatedExercisesHorizontal({
  title = 'Bài tập liên quan',
  description = 'Khám phá thêm các bài tập tương tự',
  currentExercise,
  allExercises = [],
  limit = 8
}) {
  const relatedExercises = useMemo(() => {
    if (!currentExercise || !Array.isArray(allExercises)) return [];

    const currentMuscleIds = new Set(
      (currentExercise.muscles || []).map(muscle => String(muscle._id))
    );

    const scoredExercises = allExercises
      .filter(item => String(item._id) !== String(currentExercise._id))
      .map(item => {
        const sameType = item.type === currentExercise.type ? 1 : 0;

        const sharedMuscles = (item.muscles || []).filter(muscle =>
          currentMuscleIds.has(String(muscle._id))
        ).length;

        const sameDifficulty =
          item.difficulty && currentExercise.difficulty
            ? item.difficulty === currentExercise.difficulty
              ? 1
              : 0
            : 0;

        const score = sameType * 10 + sharedMuscles * 5 + sameDifficulty * 2;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredExercises.length >= limit) {
      return scoredExercises.slice(0, limit);
    }

    const selectedIds = new Set(scoredExercises.map(item => String(item._id)));

    const fallbackExercises = allExercises
      .filter(
        item =>
          String(item._id) !== String(currentExercise._id) &&
          !selectedIds.has(String(item._id))
      )
      .slice(0, limit - scoredExercises.length);

    return [...scoredExercises, ...fallbackExercises].slice(0, limit);
  }, [currentExercise, allExercises, limit]);

  if (!relatedExercises?.length) return null;

  return (
    <section className='mt-16 space-y-6'>
      <div className='rounded-[28px] bg-card/70 p-5 shadow-sm ring-1 ring-border/60 backdrop-blur sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-black tracking-tight text-foreground'>
              {title}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
          </div>

          <span className='inline-flex w-fit items-center rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-muted-foreground'>
            {relatedExercises.length} bài tập
          </span>
        </div>
      </div>

      <div className='-mx-4 overflow-x-auto px-4 pb-2'>
        <div className='flex gap-5'>
          {relatedExercises.map(exercise => (
            <ExerciseRelatedCard key={exercise._id} exercise={exercise} />
          ))}
        </div>
      </div>
    </section>
  );
}
