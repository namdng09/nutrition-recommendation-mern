export default function DishStat({ icon, label, value, color = 'orange' }) {
  const COLORS = {
    orange:
      'bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
    emerald:
      'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
    sky: 'bg-sky-50 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20'
  };

  return (
    <div
      className={`group flex flex-col items-center justify-center gap-4 rounded-[1.75rem] p-6 text-center ring-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        COLORS[color] || COLORS.orange
      }`}
    >
      <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-background/70 text-2xl shadow-sm ring-1 ring-black/5 dark:bg-background/40 dark:ring-white/10'>
        {icon}
      </div>

      <div className='space-y-1'>
        <p className='text-[10px] font-black uppercase tracking-[0.22em] opacity-70'>
          {label}
        </p>

        <p className='text-xl font-black leading-none'>{value}</p>
      </div>
    </div>
  );
}
