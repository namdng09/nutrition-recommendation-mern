import React from 'react';

export default function MacroItem({ label, value, icon, unit = 'g' }) {
  return (
    <div className='relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-secondary/10 p-2'>
      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm'>
        {icon && React.cloneElement(icon, { size: 12 })}
      </div>

      <div className='text-center leading-tight'>
        <p className='text-[10px] font-bold uppercase tracking-tight text-muted-foreground'>
          {label}
        </p>
        <p className='text-xs font-black text-foreground'>
          {value ?? '--'}
          {unit}
        </p>
      </div>
    </div>
  );
}
