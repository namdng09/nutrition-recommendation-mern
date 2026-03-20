import {
  HiArrowLeft,
  HiFire,
  HiOutlineChartPie,
  HiOutlineShieldCheck,
  HiOutlineSparkles
} from 'react-icons/hi';
import { IoNutritionOutline, IoWaterOutline } from 'react-icons/io5';
import { Link, useParams } from 'react-router';

import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { cn, findByLabel, formatDateVI, formatValue } from '~/lib/utils';

import { useScheduleDetail } from '../api/view-schedule-detail';

const getProgressColor = percent => {
  if (percent >= 120) return 'bg-destructive';
  if (percent >= 90) return 'bg-emerald-500';
  if (percent >= 70) return 'bg-amber-500';
  return 'bg-primary';
};

function StatCard({ icon, title, value, unit, note, className }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-border bg-card p-5 shadow-sm',
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

function MacroCard({ label, value, unit, kcal, percent }) {
  return (
    <div className='rounded-[24px] border border-border bg-background/70 p-4'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div>
          <p className='text-[14px] font-black text-foreground'>{label}</p>
          <p className='text-[11px] text-muted-foreground'>
            {Math.round(kcal)} kcal
          </p>
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

function NutritionTable({ title, items = [], tone = 'default' }) {
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
    <div className={cn('rounded-[28px] border p-5 shadow-sm', toneStyle.wrap)}>
      <div className='mb-4'>
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

function MealEnergyCard({ meal }) {
  const totalEnergy = (meal?.dishes || []).reduce(
    (sum, dish) => sum + Number(dish?.energy || 0),
    0
  );

  return (
    <div className='rounded-[24px] border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-[14px] font-black text-foreground'>
            {meal.mealType}
          </p>
          <p className='mt-1 text-[11px] text-muted-foreground'>
            {(meal?.dishes || []).length} món ăn
          </p>
        </div>

        <div className='rounded-full bg-primary/10 px-3 py-1 text-[12px] font-black text-primary'>
          {Math.round(totalEnergy)} kcal
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        {(meal?.dishes || []).map(dish => (
          <div
            key={dish._id || dish.dishId}
            className='flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5'
          >
            <div className='min-w-0'>
              <p className='truncate text-[12px] font-semibold text-foreground'>
                {dish.name}
              </p>
            </div>
            <span className='shrink-0 text-[11px] font-bold text-muted-foreground'>
              {Math.round(Number(dish.energy || 0))} kcal
            </span>
          </div>
        ))}

        {(meal?.dishes || []).length === 0 && (
          <div className='text-[12px] italic text-muted-foreground'>
            Chưa có món ăn
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScheduleNutritionContent() {
  const { id } = useParams();
  const { data: schedule } = useScheduleDetail(id);
  const { data: profile } = useProfile();

  const targetCalories = profile?.nutritionTarget?.caloriesTarget ?? 0;

  const nutrition = schedule?.totalNutrition || {};
  const nutrients = nutrition?.nutrients || [];
  const minerals = nutrition?.minerals || [];
  const vitamins = nutrition?.vitamins || [];

  const energy = findByLabel(nutrients, 'Năng lượng')?.value ?? 0;
  const protein = findByLabel(nutrients, 'Protein')?.value ?? 0;
  const fat = findByLabel(nutrients, 'Chất béo')?.value ?? 0;
  const carbs = findByLabel(nutrients, 'Tinh bột')?.value ?? 0;
  const fiber = findByLabel(nutrients, 'Chất xơ')?.value ?? 0;
  const water = findByLabel(nutrients, 'Nước')?.value ?? 0;
  const sugar = findByLabel(nutrients, 'Đường')?.value ?? 0;
  const sodium = findByLabel(minerals, 'Natri')?.value ?? 0;
  const calcium = findByLabel(minerals, 'Calci')?.value ?? 0;
  const vitaminC = findByLabel(vitamins, 'Vitamin C')?.value ?? 0;

  const totalDishes = (schedule?.meals || []).reduce(
    (sum, meal) => sum + (meal?.dishes?.length || 0),
    0
  );

  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPercent = (proteinKcal / totalMacroKcal) * 100;
  const carbsPercent = (carbsKcal / totalMacroKcal) * 100;
  const fatPercent = (fatKcal / totalMacroKcal) * 100;

  const caloriesPercent = targetCalories ? (energy / targetCalories) * 100 : 0;

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8'>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='mb-3'>
              <Link
                to='/schedules/day'
                className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-bold text-foreground shadow-sm transition hover:bg-muted'
              >
                <HiArrowLeft size={16} />
                Quay lại lịch ăn
              </Link>
            </div>

            <h1 className='text-3xl font-black tracking-tight text-foreground'>
              Phân tích dinh dưỡng
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDateVI(schedule?.date, 'EEEE, dd/MM/yyyy')}
            </p>
          </div>

          {targetCalories > 0 && (
            <div className='rounded-[24px] border border-[#2D6A4F]/20 bg-[#F0F7F4] px-4 py-3 shadow-sm'>
              <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D6A4F]/60'>
                Mục tiêu ngày
              </p>
              <div className='mt-1 flex items-center gap-2'>
                <HiFire className='text-[#2D6A4F]' size={16} />
                <p className='text-[15px] font-black text-[#1B4332]'>
                  {targetCalories}{' '}
                  <span className='text-[11px] font-bold opacity-60'>kcal</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            icon={<HiFire size={20} />}
            title='Tổng năng lượng'
            value={energy}
            unit='kcal'
            note={
              targetCalories
                ? `Khoảng ${Math.round(caloriesPercent)}% mục tiêu hằng ngày`
                : 'Chưa thiết lập mục tiêu calo'
            }
            className='bg-gradient-to-br from-orange-50 to-white dark:from-orange-500/10 dark:to-background'
          />

          <StatCard
            icon={<IoNutritionOutline size={20} />}
            title='Tổng món ăn'
            value={totalDishes}
            unit='món'
            note='Tổng số món trong lịch ăn'
            className='bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-background'
          />

          <StatCard
            icon={<IoWaterOutline size={20} />}
            title='Nước'
            value={water}
            unit='g'
            note='Lượng nước ước tính từ thực phẩm'
            className='bg-gradient-to-br from-sky-50 to-white dark:from-sky-500/10 dark:to-background'
          />

          <StatCard
            icon={<HiOutlineShieldCheck size={20} />}
            title='Chất xơ'
            value={fiber}
            unit='g'
            note='Hỗ trợ tiêu hoá và no lâu'
            className='bg-gradient-to-br from-violet-50 to-white dark:from-violet-500/10 dark:to-background'
          />
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <HiOutlineChartPie size={18} />
              </span>
              <div>
                <h2 className='text-lg font-black text-foreground'>
                  Phân bố đa lượng
                </h2>
                <p className='text-[12px] text-muted-foreground'>
                  Tính theo năng lượng từ protein, chất béo và tinh bột
                </p>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <MacroCard
                label='Protein'
                value={protein}
                unit='g'
                kcal={proteinKcal}
                percent={proteinPercent}
              />
              <MacroCard
                label='Chất béo'
                value={fat}
                unit='g'
                kcal={fatKcal}
                percent={fatPercent}
              />
              <MacroCard
                label='Tinh bột'
                value={carbs}
                unit='g'
                kcal={carbsKcal}
                percent={carbsPercent}
              />
            </div>

            <div className='mt-5 rounded-[24px] border border-border/60 bg-background/70 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-[13px] font-black text-foreground'>
                  Tiến độ so với mục tiêu calo
                </p>
                <p className='text-[12px] font-bold text-muted-foreground'>
                  {targetCalories
                    ? `${Math.round(caloriesPercent)}%`
                    : 'Chưa có mục tiêu'}
                </p>
              </div>

              <div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    getProgressColor(caloriesPercent)
                  )}
                  style={{ width: `${Math.min(caloriesPercent || 0, 100)}%` }}
                />
              </div>

              <p className='mt-2 text-[12px] leading-relaxed text-muted-foreground'>
                {targetCalories
                  ? `Lịch ăn này cung cấp khoảng ${Math.round(
                      energy
                    )} kcal trên mục tiêu ${Math.round(targetCalories)} kcal.`
                  : 'Bạn chưa thiết lập mục tiêu calo trong hồ sơ.'}
              </p>
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <div className='mb-5 flex items-center gap-3'>
              <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <HiOutlineSparkles size={18} />
              </span>
              <div>
                <h2 className='text-lg font-black text-foreground'>
                  Chỉ số nổi bật
                </h2>
                <p className='text-[12px] text-muted-foreground'>
                  Một số thành phần đáng chú ý trong ngày
                </p>
              </div>
            </div>

            <div className='grid gap-3'>
              <div className='rounded-2xl border border-border/60 bg-background/70 p-4'>
                <p className='text-[11px] font-black uppercase tracking-widest text-muted-foreground/70'>
                  Đường
                </p>
                <p className='mt-1 text-xl font-black text-foreground'>
                  {formatValue(sugar, 'g')} g
                </p>
              </div>

              <div className='rounded-2xl border border-border/60 bg-background/70 p-4'>
                <p className='text-[11px] font-black uppercase tracking-widest text-muted-foreground/70'>
                  Natri
                </p>
                <p className='mt-1 text-xl font-black text-foreground'>
                  {formatValue(sodium, 'mg')} mg
                </p>
              </div>

              <div className='rounded-2xl border border-border/60 bg-background/70 p-4'>
                <p className='text-[11px] font-black uppercase tracking-widest text-muted-foreground/70'>
                  Calci
                </p>
                <p className='mt-1 text-xl font-black text-foreground'>
                  {formatValue(calcium, 'mg')} mg
                </p>
              </div>

              <div className='rounded-2xl border border-border/60 bg-background/70 p-4'>
                <p className='text-[11px] font-black uppercase tracking-widest text-muted-foreground/70'>
                  Vitamin C
                </p>
                <p className='mt-1 text-xl font-black text-foreground'>
                  {formatValue(vitaminC, 'mg')} mg
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-3'>
          <NutritionTable
            title='Tổng dưỡng chất'
            items={nutrients}
            tone='default'
          />
          <NutritionTable title='Khoáng chất' items={minerals} tone='mineral' />
          <NutritionTable title='Vitamin' items={vitamins} tone='vitamin' />
        </div>

        <div className='mt-6 rounded-[28px] border border-border bg-card p-5 shadow-sm'>
          <h2 className='mb-5 text-lg font-black text-foreground'>
            Năng lượng theo bữa
          </h2>

          <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {(schedule?.meals || []).map(meal => (
              <MealEnergyCard key={meal._id || meal.mealType} meal={meal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
