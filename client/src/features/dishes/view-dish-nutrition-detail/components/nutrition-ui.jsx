import { formatValue } from '~/lib/utils';

export function MacroCard({ label, value = 0, unit = 'g', icon }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-[2.5rem] border border-border bg-card p-6 shadow-sm transition hover:scale-105'>
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary shadow'>
        {icon}
      </div>

      <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
        {label}
      </p>

      <div className='mt-1 flex items-baseline gap-1'>
        <span className='text-2xl font-black'>{formatValue(value)}</span>
        <span className='text-xs font-bold text-muted-foreground'>{unit}</span>
      </div>
    </div>
  );
}

export function SectionWrapper({ title, icon, data }) {
  if (!data?.length) return null;

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 px-2'>
        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary shadow'>
          {icon}
        </span>

        <h2 className='text-sm font-black uppercase tracking-widest text-muted-foreground'>
          {title}
        </h2>
      </div>

      <div className='grid gap-3'>
        {data.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className='flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm border border-border hover:border-primary/30'
          >
            <span className='text-sm font-medium text-muted-foreground'>
              {item.label}
            </span>

            <div className='flex items-baseline gap-1'>
              <span className='font-black'>{formatValue(item.value)}</span>

              <span className='text-[10px] font-bold uppercase text-muted-foreground'>
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailedList({ title, data }) {
  if (!data?.length) return null;

  return (
    <div className='space-y-4'>
      <h3 className='text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2'>
        {title}
      </h3>

      <div className='space-y-3'>
        {data.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className='flex items-center justify-between text-sm'
          >
            <span className='font-medium text-muted-foreground italic'>
              {item.label}
            </span>

            <div className='flex-1 mx-4 h-px bg-border' />

            <span className='font-black'>
              {formatValue(item.value)}
              <small className='ml-0.5 text-muted-foreground'>
                {item.unit}
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
