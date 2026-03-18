import { Check, ChevronDown, Dumbbell } from 'lucide-react';

import { getPreviewImage, isGifUrl } from '~/lib/utils';

export default function ExerciseSelectorSection({
  exercises,
  selectedExercise,
  form,
  isExerciseListOpen,
  setIsExerciseListOpen,
  onSelectExercise
}) {
  const isGif = isGifUrl(selectedExercise?.tutorial);
  const preview = getPreviewImage(selectedExercise?.tutorial);

  return (
    <div className='space-y-2'>
      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Dumbbell className='h-4 w-4 text-muted-foreground' />
        Bài tập
      </label>

      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsExerciseListOpen(prev => !prev)}
          className='flex h-16 w-full items-center justify-between rounded-2xl border border-border bg-background px-5 text-left outline-none transition hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15'
        >
          {selectedExercise ? (
            <div className='flex min-w-0 items-center gap-3'>
              {selectedExercise.tutorial ? (
                <div className='h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                  <img
                    src={preview}
                    alt={selectedExercise.name}
                    loading='lazy'
                    decoding='async'
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                    onMouseEnter={e => {
                      if (isGif)
                        e.currentTarget.src = selectedExercise.tutorial;
                    }}
                    onMouseLeave={e => {
                      if (isGif) e.currentTarget.src = preview;
                    }}
                  />
                </div>
              ) : (
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground'>
                  <Dumbbell className='h-4 w-4' />
                </div>
              )}

              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-foreground'>
                  {selectedExercise.name}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {selectedExercise.type}
                </p>
              </div>
            </div>
          ) : (
            <span className='text-sm text-muted-foreground'>Chọn bài tập</span>
          )}

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
              isExerciseListOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isExerciseListOpen && (
          <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl'>
            {exercises.length === 0 ? (
              <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
                Không có bài tập nào.
              </div>
            ) : (
              <div className='space-y-1'>
                {exercises.map(exercise => {
                  const isSelected =
                    String(exercise._id) === String(form.exerciseId);

                  return (
                    <button
                      key={exercise._id}
                      type='button'
                      onClick={() => onSelectExercise(exercise)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      {exercise.tutorial ? (
                        <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                          <img
                            src={exercise.tutorial}
                            alt={exercise.name}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground'>
                          <Dumbbell className='h-5 w-5' />
                        </div>
                      )}

                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {exercise.name}
                        </p>

                        <div className='mt-1 flex flex-wrap items-center gap-2'>
                          {exercise.type && (
                            <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600'>
                              {exercise.type}
                            </span>
                          )}

                          {exercise.difficulty && (
                            <span className='inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600'>
                              {exercise.difficulty}
                            </span>
                          )}

                          {exercise.logType && (
                            <span className='inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600'>
                              {exercise.logType}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className='h-4 w-4 shrink-0 text-primary' />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
