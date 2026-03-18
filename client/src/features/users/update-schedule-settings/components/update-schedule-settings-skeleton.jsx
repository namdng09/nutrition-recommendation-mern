import { Calendar } from 'lucide-react';

const UpdateScheduleSettingsSkeleton = () => {
  return (
    <div className='px-4 pb-24 sm:px-6'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-6 rounded-2xl border border-border/60 bg-background p-5 shadow-sm'>
          <div className='h-6 w-28 animate-pulse rounded-full bg-muted' />
          <div className='mt-3 flex items-center gap-2'>
            <Calendar className='h-6 w-6 animate-pulse' />
            <div className='h-8 w-52 animate-pulse rounded bg-muted' />
          </div>
          <div className='mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted' />
        </div>

        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5'
            >
              <div className='mb-4 border-b border-border/70 pb-4'>
                <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                <div className='mt-2 h-6 w-36 animate-pulse rounded bg-muted' />
                <div className='mt-3 flex flex-wrap gap-2'>
                  {[...Array(3)].map((__, k) => (
                    <div
                      key={k}
                      className='h-6 w-24 animate-pulse rounded-full bg-muted'
                    />
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {[...Array(6)].map((_, j) => (
                  <div key={j} className='space-y-2'>
                    <div className='h-4 w-28 animate-pulse rounded bg-muted' />
                    <div className='h-10 w-full animate-pulse rounded-xl bg-muted' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4 sm:p-5'>
          <div className='h-4 w-40 animate-pulse rounded bg-muted' />
          <div className='mt-2 h-3 w-72 animate-pulse rounded bg-muted' />
          <div className='mt-3 flex flex-wrap gap-2'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-8 w-24 animate-pulse rounded-full bg-muted'
              />
            ))}
          </div>
        </div>

        <div className='fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4'>
          <div className='mx-auto max-w-5xl'>
            <div className='ml-auto h-10 w-full animate-pulse rounded-xl bg-muted sm:w-40' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateScheduleSettingsSkeleton;
