import {
  HiOutlineClipboardList,
  HiOutlineInformationCircle
} from 'react-icons/hi';

import { cn, formatValue } from '~/lib/utils';

import {
  getMealIcon,
  getMealIconWrapClass,
  getProgressColor,
  getStatusTone
} from './nutrition-helpers';

export function NutritionStatCard({
  icon,
  title,
  value,
  unit,
  note,
  className
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
        {icon}
      </div>

      <p className='text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/70'>
        {title}
      </p>

      <div className='mt-1 flex items-end gap-1'>
        <span className='text-3xl font-black tracking-tight text-foreground'>
          {formatValue(value, unit)}
        </span>
        <span className='mb-1 text-[11px] font-bold text-muted-foreground'>
          {unit}
        </span>
      </div>

      {note && (
        <p className='mt-2 text-[12px] leading-relaxed text-muted-foreground'>
          {note}
        </p>
      )}
    </div>
  );
}

export function NutritionSummaryChip({ icon, label, value }) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm'>
      <span className='text-primary'>{icon}</span>
      <span>{label}:</span>
      <span className='font-black'>{value}</span>
    </div>
  );
}

export function NutritionOverviewAlert({ percent, targetCalories, energy }) {
  const tone = getStatusTone(percent);

  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 shadow-sm transition-all',
        tone.wrap
      )}
    >
      <div className='flex items-start gap-3'>
        <span className={cn('mt-0.5', tone.icon)}>
          <HiOutlineInformationCircle size={20} />
        </span>

        <div>
          <p className='text-[13px] font-black text-foreground'>{tone.text}</p>
          <p className='mt-1 text-[12px] leading-relaxed text-muted-foreground'>
            {targetCalories
              ? `Lịch ăn hiện tại cung cấp khoảng ${Math.round(
                  energy
                )} kcal trên mục tiêu ${Math.round(targetCalories)} kcal, tương đương ${Math.round(
                  percent
                )}% kế hoạch trong ngày.`
              : 'Bạn chưa có mục tiêu calo hằng ngày để hệ thống đối chiếu.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NutritionMacroCard({
  label,
  value,
  unit,
  kcal,
  percent,
  icon,
  accent
}) {
  return (
    <div className='rounded-[24px] border border-border bg-background/70 p-4'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl',
              accent
            )}
          >
            {icon}
          </span>

          <div>
            <p className='text-[14px] font-black text-foreground'>{label}</p>
            <p className='text-[11px] text-muted-foreground'>
              {Math.round(kcal)} kcal
            </p>
          </div>
        </div>

        <div className='text-right'>
          <p className='text-[18px] font-black text-foreground'>
            {formatValue(value, unit)}
          </p>
          <p className='text-[11px] font-medium text-muted-foreground'>
            {unit}
          </p>
        </div>
      </div>

      <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            getProgressColor(percent)
          )}
          style={{ width: `${Math.min(percent || 0, 100)}%` }}
        />
      </div>

      <div className='mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground'>
        <span>{Math.round(percent || 0)}%</span>
        <span>tỉ trọng năng lượng</span>
      </div>
    </div>
  );
}

export function NutritionComparisonCard({
  title,
  current,
  target,
  unit,
  icon,
  accent
}) {
  const percent = target ? (current / target) * 100 : 0;

  return (
    <div className='rounded-[24px] border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl',
              accent
            )}
          >
            {icon}
          </span>

          <div>
            <p className='text-[13px] font-black text-foreground'>{title}</p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              Hiện tại {formatValue(current, unit)} {unit}
            </p>
          </div>
        </div>

        <span className='rounded-full bg-muted px-2.5 py-1 text-[11px] font-black text-foreground'>
          {Math.round(percent)}%
        </span>
      </div>

      <div className='mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            getProgressColor(percent)
          )}
          style={{ width: `${Math.min(percent || 0, 100)}%` }}
        />
      </div>

      <div className='mt-2 flex items-center justify-between text-[11px] text-muted-foreground'>
        <span>Mục tiêu</span>
        <span>
          {target ? `${formatValue(target, unit)} ${unit}` : 'Chưa có'}
        </span>
      </div>
    </div>
  );
}

export function NutritionHighlightCard({
  icon,
  label,
  value,
  unit,
  accent = 'text-primary'
}) {
  return (
    <div className='rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-[11px] font-black uppercase tracking-widest text-muted-foreground/70'>
            {label}
          </p>
          <p className='mt-1 text-xl font-black text-foreground'>
            {formatValue(value, unit)} {unit}
          </p>
        </div>

        <span className={cn('mt-1', accent)}>{icon}</span>
      </div>
    </div>
  );
}

export function NutritionInsightCard({
  icon,
  title,
  desc,
  accent = 'text-primary'
}) {
  return (
    <div className='rounded-[24px] border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <span className={cn('mt-0.5', accent)}>{icon}</span>
        <div>
          <p className='text-[13px] font-black text-foreground'>{title}</p>
          <p className='mt-1 text-[12px] leading-relaxed text-muted-foreground'>
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MealDishRow({ dish }) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5'>
      <div className='min-w-0'>
        <p className='truncate text-[12px] font-semibold text-foreground'>
          {dish.name}
        </p>
        <p className='mt-0.5 text-[11px] text-muted-foreground'>
          {dish.servings || 1} phần
        </p>
      </div>

      <div className='text-right'>
        <p className='text-[11px] font-black text-foreground'>
          {Math.round(Number(dish.energy || 0))} kcal
        </p>
      </div>
    </div>
  );
}

export function MealEnergyCard({ meal }) {
  const totalEnergy = (meal?.dishes || []).reduce(
    (sum, dish) => sum + Number(dish?.energy || 0),
    0
  );

  return (
    <div className='rounded-[24px] border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl',
              getMealIconWrapClass(meal.mealType)
            )}
          >
            {getMealIcon(meal.mealType)}
          </span>

          <div>
            <p className='text-[14px] font-black text-foreground'>
              {meal.mealType}
            </p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              {(meal?.dishes || []).length} món ăn
            </p>
          </div>
        </div>

        <div className='rounded-full bg-primary/10 px-3 py-1 text-[12px] font-black text-primary'>
          {Math.round(totalEnergy)} kcal
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        {(meal?.dishes || []).map(dish => (
          <MealDishRow key={dish._id || dish.dishId} dish={dish} />
        ))}

        {(meal?.dishes || []).length === 0 && (
          <div className='text-[12px] italic text-muted-foreground'>
            Chưa có món ăn
          </div>
        )}
      </div>

      {meal?.notes ? (
        <div className='mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-3'>
          <div className='flex items-start gap-2'>
            <HiOutlineClipboardList className='mt-0.5 text-primary' size={16} />
            <div>
              <p className='text-[10px] font-black uppercase tracking-widest text-primary/70'>
                Ghi chú
              </p>
              <p className='mt-1 text-[12px] leading-relaxed text-foreground/80'>
                {meal.notes}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
