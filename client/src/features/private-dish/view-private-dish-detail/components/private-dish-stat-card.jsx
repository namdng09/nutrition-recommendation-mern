import React from 'react';

export default function PrivateDishStatCard({
  icon,
  label,
  value,
  tone = 'orange'
}) {
  const toneMap = {
    orange: {
      wrapper:
        'border-orange-200/70 bg-orange-50/80 dark:border-orange-500/20 dark:bg-orange-500/10',
      icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
    },
    emerald: {
      wrapper:
        'border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10',
      icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
    },
    sky: {
      wrapper:
        'border-sky-200/70 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10',
      icon: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300'
    }
  };

  return (
    <div
      className={`rounded-[26px] border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${toneMap[tone].wrapper}`}
    >
      <div className='flex items-start gap-3'>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneMap[tone].icon}`}
        >
          {icon}
        </div>

        <div className='min-w-0'>
          <p className='text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
            {label}
          </p>
          <p className='mt-1 text-lg font-black tracking-tight text-foreground'>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
