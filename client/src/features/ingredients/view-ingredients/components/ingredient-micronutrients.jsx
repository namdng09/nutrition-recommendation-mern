import React from 'react';

function Block({ title, items }) {
  if (!items.length) return null;

  return (
    <div className='rounded-xl bg-secondary/20 p-3 ring-1 ring-border/50'>
      <div className='mb-2 text-xs font-black uppercase text-muted-foreground'>
        {title}
      </div>

      {items.slice(0, 3).map(x => (
        <div key={x.label} className='flex justify-between text-xs'>
          <span>{x.label}</span>
          <span>
            {x.value} {x.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function IngredientMicronutrients({ minerals, vitamins }) {
  return (
    <div className='space-y-3 mt-2'>
      <Block title='Khoáng chất' items={minerals} />
      <Block title='Vitamin' items={vitamins} />
    </div>
  );
}
