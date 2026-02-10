import React from 'react';

export default function NutritionStatCard({ icon, label, value, color }) {
  const colorMap = {
    orange: {
      card: 'from-orange-50/50 to-white dark:from-orange-950/20 dark:to-card',
      border: 'border-orange-100/80 dark:border-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      glow: 'bg-orange-400/10 dark:bg-orange-400/5'
    },
    emerald: {
      card: 'from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-card',
      border: 'border-emerald-100/80 dark:border-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'bg-emerald-400/10 dark:bg-emerald-400/5'
    },
    sky: {
      card: 'from-sky-50/50 to-white dark:from-sky-950/20 dark:to-card',
      border: 'border-sky-100/80 dark:border-sky-900/30',
      text: 'text-sky-600 dark:text-sky-400',
      glow: 'bg-sky-400/10 dark:bg-sky-400/5'
    },
    fuchsia: {
      card: 'from-fuchsia-50/50 to-white dark:from-fuchsia-950/20 dark:to-card',
      border: 'border-fuchsia-100/80 dark:border-fuchsia-900/30',
      text: 'text-fuchsia-600 dark:text-fuchsia-400',
      glow: 'bg-fuchsia-400/10 dark:bg-fuchsia-400/5'
    },
    violet: {
      card: 'from-violet-50/50 to-white dark:from-violet-950/20 dark:to-card',
      border: 'border-violet-100/80 dark:border-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      glow: 'bg-violet-400/10 dark:bg-violet-400/5'
    },
    amber: {
      card: 'from-amber-50/50 to-white dark:from-amber-950/20 dark:to-card',
      border: 'border-amber-100/80 dark:border-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'bg-amber-400/10 dark:bg-amber-400/5'
    }
  };

  const c = colorMap[color] || colorMap.orange;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none ${c.card} ${c.border}`}
    >
      <div
        className={`absolute -right-2 -top-2 h-12 w-12 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${c.glow}`}
      />

      <div className='relative z-10'>
        <div className='flex items-center gap-2.5'>
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] dark:ring-white/[0.05] transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${c.text}`}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { size: 16, strokeWidth: 2.5 })
              : icon}
          </div>

          <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80'>
            {label}
          </span>
        </div>

        <div className='mt-3 flex items-end justify-between'>
          <span className='text-xl font-extrabold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-0.5'>
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}
