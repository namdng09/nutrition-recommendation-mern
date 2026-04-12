import React from 'react';

export default function PrivateDishSectionCard({
  icon,
  title,
  count,
  iconTone = 'primary',
  children
}) {
  const iconToneMap = {
    primary: 'bg-primary/10 text-primary',
    orange:
      'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    emerald:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber:
      'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'
  };

  return (
    <section className='overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_16px_40px_rgba(15,23,42,0.05)]'>
      <div className='flex items-center justify-between border-b border-border/70 px-5 py-5 md:px-7'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconToneMap[iconTone]}`}
          >
            {icon}
          </div>

          <h2 className='text-xl font-black tracking-tight text-foreground md:text-2xl'>
            {title}
          </h2>
        </div>

        {typeof count === 'number' ? (
          <span className='inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-muted px-3 text-sm font-bold text-foreground'>
            {count}
          </span>
        ) : null}
      </div>

      <div className='p-5 md:p-7'>{children}</div>
    </section>
  );
}
