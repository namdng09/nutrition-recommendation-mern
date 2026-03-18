export default function InfoItem({
  icon,
  label,
  value,
  colorClass = 'text-foreground'
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${colorClass}`}
    >
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/70'>
        {icon}
      </div>

      <div className='min-w-0'>
        <p className='text-[10px] font-bold uppercase tracking-wider'>
          {label}
        </p>
        <p className='truncate text-sm font-semibold sm:text-base'>
          {value || '--'}
        </p>
      </div>
    </div>
  );
}
