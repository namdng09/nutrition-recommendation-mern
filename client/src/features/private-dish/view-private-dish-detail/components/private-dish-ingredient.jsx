import React from 'react';
import { FaCarrot } from 'react-icons/fa';
import { Link } from 'react-router';

export default function PrivateDishIngredient({ ingredients, SectionCard }) {
  if (!ingredients?.length) return null;

  return (
    <SectionCard
      icon={<FaCarrot />}
      title='Nguyên liệu'
      count={ingredients.length}
      iconTone='orange'
    >
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {ingredients.map(item => {
          const unit = item.units?.find(u => u.isDefault);

          return (
            <Link
              key={item._id}
              to={`/ingredients/${item.ingredientId}`}
              className='group rounded-[28px] border border-border bg-gradient-to-br from-background to-orange-50/35 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/60 dark:to-orange-500/5 dark:hover:border-orange-500/20 dark:hover:bg-orange-500/10'
            >
              <div className='flex items-center gap-4'>
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className='h-16 w-16 rounded-2xl border border-border bg-muted object-cover shadow-sm'
                />

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-base font-bold text-foreground'>
                    {item.name}
                  </p>

                  <div className='mt-2 inline-flex items-center rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm'>
                    {unit?.quantity ?? '-'} {unit?.unit ?? ''}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
