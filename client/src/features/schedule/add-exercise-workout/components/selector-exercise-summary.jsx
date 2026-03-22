import { Dumbbell } from 'lucide-react';

export default function SelectedExerciseSummary({ selectedExercise }) {
  return (
    <div className='rounded-2xl border border-border bg-muted/30 px-4 py-3'>
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <Dumbbell className='h-5 w-5' />
        </div>

        <div className='min-w-0'>
          <p className='truncate text-sm font-bold text-foreground'>
            {selectedExercise.name}
          </p>

          <div className='mt-1 flex flex-wrap items-center gap-2'>
            {selectedExercise.type && (
              <span className='inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600'>
                {selectedExercise.type}
              </span>
            )}

            {selectedExercise.difficulty && (
              <span className='inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600'>
                {selectedExercise.difficulty}
              </span>
            )}

            {selectedExercise.logType && (
              <span className='inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600'>
                {selectedExercise.logType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
