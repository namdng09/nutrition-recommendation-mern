import { cn, formatValue } from '~/lib/utils';

import NutritionSectionHeader from './nutrition-section-header';

export function NutritionTable({ title, items = [], tone = 'default', icon }) {
  const toneMap = {
    default: {
      wrap: 'border-border bg-card',
      badge: 'bg-primary/10 text-primary'
    },
    vitamin: {
      wrap: 'border-amber-200/60 bg-amber-50/40 dark:bg-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-600'
    },
    mineral: {
      wrap: 'border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-500/5',
      badge: 'bg-emerald-500/10 text-emerald-600'
    }
  };

  const toneStyle = toneMap[tone] || toneMap.default;

  return (
    <div
      className={cn(
        'rounded-[28px] border p-5 shadow-sm transition-all hover:shadow-md',
        toneStyle.wrap
      )}
    >
      <div className='mb-4 flex items-center gap-2'>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            toneStyle.badge
          )}
        >
          {icon}
        </span>

        <span
          className={cn(
            'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
            toneStyle.badge
          )}
        >
          {title}
        </span>
      </div>

      <div className='space-y-2'>
        {items.map(item => (
          <div
            key={item.label}
            className='flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background/70 px-4 py-3'
          >
            <div className='min-w-0'>
              <p className='truncate text-[13px] font-bold text-foreground'>
                {item.label}
              </p>
            </div>

            <div className='shrink-0 text-right'>
              <p className='text-[13px] font-black text-foreground'>
                {formatValue(item.value, item.unit)}
              </p>
              <p className='text-[11px] font-medium text-muted-foreground'>
                {item.unit}
              </p>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className='rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground'>
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
}

export function TopDishesCard({ dishes = [], icon }) {
  return (
    <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
      <NutritionSectionHeader
        icon={icon}
        title='Top món nhiều năng lượng'
        desc='Những món đóng góp nhiều kcal nhất trong lịch ăn'
        badge='Top Dishes'
      />

      <div className='space-y-3'>
        {dishes.map((dish, index) => (
          <div
            key={`${dish.dishId}-${index}`}
            className='flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-4 py-3'
          >
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[12px] font-black text-primary'>
                #{index + 1}
              </span>

              <div className='min-w-0'>
                <p className='truncate text-[13px] font-bold text-foreground'>
                  {dish.name}
                </p>
                <p className='text-[11px] text-muted-foreground'>
                  {dish.servings || 1} phần
                </p>
              </div>
            </div>

            <span className='shrink-0 rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-black text-orange-500'>
              {Math.round(Number(dish.energy || 0))} kcal
            </span>
          </div>
        ))}

        {dishes.length === 0 && (
          <div className='rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground'>
            Chưa có dữ liệu món ăn
          </div>
        )}
      </div>
    </div>
  );
}
