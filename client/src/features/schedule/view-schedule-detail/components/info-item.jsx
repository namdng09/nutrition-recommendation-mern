export default function InfoItem({
  icon,
  label,
  value,
  colorClass = 'text-foreground'
}) {
  return (
    <div
      className={`group flex min-w-0 items-center gap-3 rounded-[1.25rem] bg-card px-4 py-3.5 shadow-sm ring-1 ring-border/60 transition-all ${colorClass}`}
    >
      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted shadow-sm ring-1 ring-border/40'>
        {icon}
      </div>

      <div className='min-w-0 space-y-0.5'>
        <p className='text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground'>
          {label}
        </p>
        <p className='truncate text-sm font-black tracking-tight sm:text-base'>
          {value || '--'}
        </p>
      </div>
    </div>
  );
}
