export default function DishStat({ icon, label, value, color = 'orange' }) {
  const COLORS = {
    orange: 'bg-orange-50 text-orange-600 ring-orange-200',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    sky: 'bg-sky-50 text-sky-600 ring-sky-200'
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl p-6 text-center ring-1 transition-all hover:-translate-y-1 hover:shadow-lg ${
        COLORS[color] || COLORS.orange
      }`}
    >
      <div className='flex h-12 w-12 items-center justify-center text-2xl'>
        {icon}
      </div>

      <p className='text-[11px] font-extrabold uppercase tracking-[0.2em] opacity-70'>
        {label}
      </p>

      <p className='text-lg font-black leading-none'>{value}</p>
    </div>
  );
}
