import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FaAppleAlt, FaFireAlt, FaFlask, FaLeaf, FaTint } from 'react-icons/fa';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';

const findNutrient = (nutrition, label) => {
  const nutrient = nutrition?.nutrients?.find(
    item => String(item?.label).toLowerCase() === String(label).toLowerCase()
  );

  return nutrient?.value ?? 0;
};

const formatValue = (value, unit = '') => {
  const num = Number(value ?? 0);

  if (!Number.isFinite(num)) return `0 ${unit}`.trim();
  if (unit === 'kcal') return `${Math.round(num)} ${unit}`.trim();
  if (unit === 'g' || unit === 'mg' || unit === 'ml') {
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`.trim();
  }

  return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`.trim();
};

const MacroCard = ({ title, value, unit, icon, tone = 'orange' }) => {
  const toneMap = {
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700'
  };

  return (
    <div className={`rounded-lg border p-4 ${toneMap[tone]}`}>
      <div className='mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/80'>
        {icon}
      </div>
      <p className='text-xs font-semibold uppercase tracking-wider'>{title}</p>
      <p className='mt-1 text-lg font-bold'>{formatValue(value, unit)}</p>
    </div>
  );
};

const NutrientRows = ({ items, emptyText }) => {
  return !items?.length ? (
    <p className='px-4 py-5 text-sm text-slate-600'>{emptyText}</p>
  ) : (
    <div className='divide-y'>
      {items.map((item, index) => (
        <div
          key={item?._id || `${item?.label || 'nutrient'}-${index}`}
          className='flex items-center justify-between px-4 py-3 text-sm'
        >
          <span className='font-medium text-foreground'>
            {item?.label || '-'}
          </span>
          <span className='text-slate-600'>
            {formatValue(item?.value, item?.unit)}
          </span>
        </div>
      ))}
    </div>
  );
};

const NutritionCollapsible = ({
  title,
  badge,
  defaultOpen = false,
  children
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='rounded-lg border bg-card'
    >
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left'
        >
          <div>
            <h4 className='text-sm font-semibold text-foreground'>{title}</h4>
            {badge ? (
              <p className='mt-1 text-xs text-slate-600'>{badge}</p>
            ) : null}
          </div>
          <ChevronRight
            className={`h-4 w-4 text-slate-600 transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className='border-t'>{children}</CollapsibleContent>
    </Collapsible>
  );
};

const NutritionDetail = ({ nutrition }) => {
  const hasNutrition =
    nutrition?.nutrients?.length ||
    nutrition?.vitamins?.length ||
    nutrition?.minerals?.length;

  return (
    <section className='space-y-4 rounded-xl border bg-card p-4 md:p-6'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-lg font-semibold text-foreground'>
          Chi tiết dinh dưỡng
        </h2>
        <span className='rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-slate-600'>
          Nutrition
        </span>
      </div>

      {!hasNutrition ? (
        <div className='rounded-lg border border-dashed p-4 text-sm text-slate-600'>
          Món ăn chưa có dữ liệu dinh dưỡng.
        </div>
      ) : (
        <>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <MacroCard
              title='Năng lượng'
              value={findNutrient(nutrition, 'Năng lượng')}
              unit='kcal'
              icon={<FaFireAlt />}
              tone='orange'
            />
            <MacroCard
              title='Protein'
              value={findNutrient(nutrition, 'Protein')}
              unit='g'
              icon={<FaLeaf />}
              tone='emerald'
            />
            <MacroCard
              title='Tinh bột'
              value={findNutrient(nutrition, 'Tinh bột')}
              unit='g'
              icon={<FaAppleAlt />}
              tone='sky'
            />
            <MacroCard
              title='Chất béo'
              value={findNutrient(nutrition, 'Chất béo')}
              unit='g'
              icon={<FaTint />}
              tone='rose'
            />
          </div>

          <div className='grid items-start gap-4 xl:grid-cols-2'>
            <NutritionCollapsible
              title='Vitamin'
              badge={`${nutrition?.vitamins?.length || 0} mục`}
            >
              <NutrientRows
                items={nutrition?.vitamins || []}
                emptyText='Không có thông tin vitamin.'
              />
            </NutritionCollapsible>

            <NutritionCollapsible
              title='Khoáng chất'
              badge={`${nutrition?.minerals?.length || 0} mục`}
            >
              <NutrientRows
                items={nutrition?.minerals || []}
                emptyText='Không có thông tin khoáng chất.'
              />
            </NutritionCollapsible>
          </div>

          <NutritionCollapsible
            title='Toàn bộ dưỡng chất'
            badge={`${nutrition?.nutrients?.length || 0} mục`}
          >
            <div className='flex items-center gap-2 px-4 py-3 text-slate-600'>
              <FaFlask className='text-sm' />
              <span className='text-xs'>Danh sách dưỡng chất chi tiết</span>
            </div>
            <NutrientRows
              items={nutrition?.nutrients || []}
              emptyText='Không có danh sách dưỡng chất chi tiết.'
            />
          </NutritionCollapsible>
        </>
      )}
    </section>
  );
};

export default NutritionDetail;
