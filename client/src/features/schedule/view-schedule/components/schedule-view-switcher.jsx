import { cn } from '~/lib/utils';

export default function ScheduleViewSwitcher({ view, onChange }) {
  return (
    <div className='flex rounded-lg bg-muted p-0.5'>
      {[
        { id: 'day', label: 'Ngày' },
        { id: 'week', label: 'Tuần' }
      ].map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={cn(
            'rounded-md px-3.5 py-1 text-xs font-bold transition-all',
            view === v.id
              ? 'bg-background text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
