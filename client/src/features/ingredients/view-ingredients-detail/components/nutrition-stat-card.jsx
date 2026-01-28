import React from 'react';

export default function NutritionStatCard({ icon, label, value, color }) {
  const colorMap = {
    orange: {
      card: 'from-orange-100/80 to-orange-50',
      icon: 'bg-orange-500 text-orange-600 ring-orange-500/30'
    },
    emerald: {
      card: 'from-emerald-100/80 to-emerald-50',
      icon: 'bg-emerald-500 text-emerald-600 ring-emerald-500/30'
    },
    sky: {
      card: 'from-sky-100/80 to-sky-50',
      icon: 'bg-sky-500 text-sky-600 ring-sky-500/30'
    },
    fuchsia: {
      card: 'from-fuchsia-100/80 to-fuchsia-50',
      icon: 'bg-fuchsia-500 text-fuchsia-600 ring-fuchsia-500/30'
    },
    violet: {
      card: 'from-violet-100/80 to-violet-50',
      icon: 'bg-violet-500 text-violet-600 ring-violet-500/30'
    },
    amber: {
      card: 'from-amber-100/80 to-amber-50',
      icon: 'bg-amber-500 text-amber-600 ring-amber-500/30'
    }
  };

  const c = colorMap[color];

  return (
    <div
      className={`group rounded-xl border border-border bg-gradient-to-br ${
        c.card
      } p-3 transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ${c.icon}`}
        >
          {icon}
        </span>
        {label}
      </div>

      <div className='mt-2 text-2xl font-bold tracking-tight text-foreground'>
        {value}
      </div>
    </div>
  );
}
