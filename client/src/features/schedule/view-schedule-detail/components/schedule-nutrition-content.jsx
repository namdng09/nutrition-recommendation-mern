import { GiFruitBowl, GiMeal, GiMedicines } from 'react-icons/gi';
import {
  HiArrowLeft,
  HiFire,
  HiOutlineBeaker,
  HiOutlineChartPie,
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineHeart,
  HiOutlineLightningBolt,
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineTable
} from 'react-icons/hi';
import {
  IoCafeOutline,
  IoFastFoodOutline,
  IoHeartOutline,
  IoLeaf,
  IoMoonOutline,
  IoNutritionOutline,
  IoRestaurantOutline,
  IoSunnyOutline,
  IoWaterOutline
} from 'react-icons/io5';
import { MdOutlineLocalDining, MdOutlineMonitorWeight } from 'react-icons/md';
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

const getMealIcon = mealType => {
  const text = String(mealType || '').toLowerCase();

  if (text.includes('sáng')) return <IoCafeOutline size={18} />;
  if (text.includes('trưa')) return <IoSunnyOutline size={18} />;
  if (text.includes('tối')) return <IoMoonOutline size={18} />;
  if (text.includes('nhẹ')) return <IoFastFoodOutline size={18} />;
  if (text.includes('tráng')) return <GiFruitBowl size={18} />;

  return <GiMeal size={18} />;
};

const getMealIconWrapClass = mealType => {
  const text = String(mealType || '').toLowerCase();

  if (text.includes('sáng')) return 'bg-orange-500/10 text-orange-500';
  if (text.includes('trưa')) return 'bg-amber-500/10 text-amber-500';
  if (text.includes('tối')) return 'bg-indigo-500/10 text-indigo-500';
  if (text.includes('nhẹ')) return 'bg-emerald-500/10 text-emerald-500';
  if (text.includes('tráng')) return 'bg-pink-500/10 text-pink-500';

  return 'bg-primary/10 text-primary';
};

function SectionHeader({ icon, title, desc, badge }) {
  return (
    <div className='mb-5 flex items-start justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          {icon}
        </span>

        <div>
          <h2 className='text-lg font-black text-foreground'>{title}</h2>
          {desc && <p className='text-[12px] text-muted-foreground'>{desc}</p>}
        </div>
      </div>

      {badge ? (
        <span className='rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary'>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function StatCard({ icon, title, value, unit, note, className }) {
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

function MacroCard({ label, value, unit, kcal, percent, icon, accent }) {
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

function HighlightCard({ icon, label, value, unit, accent = 'text-primary' }) {
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

function SummaryChip({ icon, label, value }) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm'>
      <span className='text-primary'>{icon}</span>
      <span>{label}:</span>
      <span className='font-black'>{value}</span>
    </div>
  );
}

function NutritionTable({ title, items = [], tone = 'default', icon }) {
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

function MealDishRow({ dish }) {
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

function MealEnergyCard({ meal }) {
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
  const cholesterol = findByLabel(nutrients, 'Cholesterol')?.value ?? 0;

  const sodium = findByLabel(minerals, 'Natri')?.value ?? 0;
  const calcium = findByLabel(minerals, 'Calci')?.value ?? 0;
  const iron = findByLabel(minerals, 'Sắt')?.value ?? 0;
  const potassium = findByLabel(minerals, 'Kali')?.value ?? 0;

  const vitaminA = findByLabel(vitamins, 'Vitamin A')?.value ?? 0;
  const vitaminC = findByLabel(vitamins, 'Vitamin C')?.value ?? 0;
  const vitaminE = findByLabel(vitamins, 'Vitamin E')?.value ?? 0;
  const folat = findByLabel(vitamins, 'Folat')?.value ?? 0;

  const totalMeals = (schedule?.meals || []).length;
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
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
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

            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary'>
                Nutrition Overview
              </span>
            </div>

            <h1 className='mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl'>
              Phân tích dinh dưỡng
            </h1>

            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDateVI(schedule?.date, 'EEEE, dd/MM/yyyy')}
            </p>

            <div className='mt-4 flex flex-wrap gap-2'>
              <SummaryChip
                icon={<MdOutlineLocalDining size={15} />}
                label='Bữa ăn'
                value={totalMeals}
              />
              <SummaryChip
                icon={<IoRestaurantOutline size={15} />}
                label='Tổng món'
                value={totalDishes}
              />
              <SummaryChip
                icon={<HiFire size={15} />}
                label='Tổng kcal'
                value={Math.round(energy)}
              />
            </div>
          </div>

          {targetCalories > 0 && (
            <div className='rounded-[24px] border border-[#2D6A4F]/20 bg-[#F0F7F4] px-4 py-4 shadow-sm'>
              <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D6A4F]/60'>
                Mục tiêu ngày
              </p>

              <div className='mt-2 flex items-center gap-2'>
                <HiFire className='text-[#2D6A4F]' size={16} />
                <p className='text-[16px] font-black text-[#1B4332]'>
                  {targetCalories}{' '}
                  <span className='text-[11px] font-bold opacity-60'>kcal</span>
                </p>
              </div>

              <div className='mt-3 h-2.5 w-52 overflow-hidden rounded-full bg-[#d8e9e0]'>
                <div
                  className='h-full rounded-full bg-[#2D6A4F] transition-all'
                  style={{ width: `${Math.min(caloriesPercent || 0, 100)}%` }}
                />
              </div>

              <p className='mt-2 text-[12px] text-[#2D6A4F]/80'>
                Đạt khoảng {Math.round(caloriesPercent)}% mục tiêu
              </p>
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
            <SectionHeader
              icon={<HiOutlineChartPie size={18} />}
              title='Phân bố đa lượng'
              desc='Tính theo năng lượng từ protein, chất béo và tinh bột'
              badge='Macros'
            />

            <div className='grid gap-4 md:grid-cols-3'>
              <MacroCard
                label='Protein'
                value={protein}
                unit='g'
                kcal={proteinKcal}
                percent={proteinPercent}
                icon={<HiOutlineLightningBolt size={18} />}
                accent='bg-blue-500/10 text-blue-500'
              />
              <MacroCard
                label='Chất béo'
                value={fat}
                unit='g'
                kcal={fatKcal}
                percent={fatPercent}
                icon={<IoLeaf size={18} />}
                accent='bg-amber-500/10 text-amber-500'
              />
              <MacroCard
                label='Tinh bột'
                value={carbs}
                unit='g'
                kcal={carbsKcal}
                percent={carbsPercent}
                icon={<HiOutlineCube size={18} />}
                accent='bg-emerald-500/10 text-emerald-500'
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

              <div className='mt-3 grid gap-3 md:grid-cols-2'>
                <div className='rounded-2xl border border-border bg-card px-4 py-3'>
                  <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/70'>
                    Năng lượng hiện tại
                  </p>
                  <p className='mt-1 text-[16px] font-black text-foreground'>
                    {Math.round(energy)} kcal
                  </p>
                </div>

                <div className='rounded-2xl border border-border bg-card px-4 py-3'>
                  <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/70'>
                    Mục tiêu
                  </p>
                  <p className='mt-1 text-[16px] font-black text-foreground'>
                    {targetCalories ? Math.round(targetCalories) : 0} kcal
                  </p>
                </div>
              </div>

              <p className='mt-3 text-[12px] leading-relaxed text-muted-foreground'>
                {targetCalories
                  ? `Lịch ăn này cung cấp khoảng ${Math.round(
                      energy
                    )} kcal trên mục tiêu ${Math.round(targetCalories)} kcal.`
                  : 'Bạn chưa thiết lập mục tiêu calo trong hồ sơ.'}
              </p>
            </div>
          </div>

          <div className='rounded-[28px] border border-border bg-card p-5 shadow-sm'>
            <SectionHeader
              icon={<HiOutlineSparkles size={18} />}
              title='Chỉ số nổi bật'
              desc='Một số thành phần đáng chú ý trong ngày'
              badge='Highlights'
            />

            <div className='grid gap-3'>
              <HighlightCard
                label='Đường'
                value={sugar}
                unit='g'
                accent='text-pink-500'
                icon={<HiOutlineSparkles size={20} />}
              />
              <HighlightCard
                label='Natri'
                value={sodium}
                unit='mg'
                accent='text-sky-500'
                icon={<HiOutlineBeaker size={20} />}
              />
              <HighlightCard
                label='Calci'
                value={calcium}
                unit='mg'
                accent='text-emerald-500'
                icon={<MdOutlineMonitorWeight size={20} />}
              />
              <HighlightCard
                label='Vitamin C'
                value={vitaminC}
                unit='mg'
                accent='text-orange-500'
                icon={<IoHeartOutline size={20} />}
              />
            </div>
          </div>
        </div>

        <div className='mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            icon={<HiOutlineHeart size={20} />}
            title='Cholesterol'
            value={cholesterol}
            unit='mg'
            note='Chỉ số chất béo liên quan tim mạch'
          />

          <StatCard
            icon={<HiOutlineBeaker size={20} />}
            title='Natri'
            value={sodium}
            unit='mg'
            note='Liên quan cân bằng nước và huyết áp'
          />

          <StatCard
            icon={<HiOutlineScale size={20} />}
            title='Sắt'
            value={iron}
            unit='mg'
            note='Hỗ trợ tạo máu và vận chuyển oxy'
          />

          <StatCard
            icon={<HiOutlineLightningBolt size={20} />}
            title='Kali'
            value={potassium}
            unit='mg'
            note='Hỗ trợ thần kinh và co cơ'
          />
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-3'>
          <NutritionTable
            title='Tổng dưỡng chất'
            items={nutrients}
            tone='default'
            icon={<HiOutlineTable size={16} />}
          />
          <NutritionTable
            title='Khoáng chất'
            items={minerals}
            tone='mineral'
            icon={<GiMedicines size={16} />}
          />
          <NutritionTable
            title='Vitamin'
            items={vitamins}
            tone='vitamin'
            icon={<IoLeaf size={16} />}
          />
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4'>
          <StatCard
            icon={<HiOutlineShieldCheck size={20} />}
            title='Vitamin A'
            value={vitaminA}
            unit='μg'
            note='Hỗ trợ thị lực và miễn dịch'
          />
          <StatCard
            icon={<HiOutlineSparkles size={20} />}
            title='Vitamin E'
            value={vitaminE}
            unit='mg'
            note='Chống oxy hoá'
          />
          <StatCard
            icon={<IoHeartOutline size={20} />}
            title='Folat'
            value={folat}
            unit='μg'
            note='Quan trọng cho quá trình tạo tế bào'
          />
          <StatCard
            icon={<HiOutlineBeaker size={20} />}
            title='Vitamin C'
            value={vitaminC}
            unit='mg'
            note='Hỗ trợ miễn dịch và chống oxy hoá'
          />
        </div>

        <div className='mt-6 rounded-[28px] border border-border bg-card p-5 shadow-sm'>
          <SectionHeader
            icon={<MdOutlineLocalDining size={18} />}
            title='Năng lượng theo bữa'
            desc='Tổng hợp năng lượng của từng bữa ăn trong ngày'
            badge='Meals'
          />

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
