import { clsx } from 'clsx';
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

import { GENDER_OPTIONS } from '~/constants/gender';
import { ROLE_OPTIONS } from '~/constants/role';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = dateString => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getGenderLabel = value => {
  const option = GENDER_OPTIONS.find(opt => opt.value === value);
  return option?.label || 'Not set';
};

export const getRoleLabel = value => {
  const option = ROLE_OPTIONS.find(opt => opt.value === value);
  return option?.label || 'Not set';
};

export const NAV_LINKS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/schedules/day', label: 'Thời gian biểu' },
  { to: '/collections', label: 'Gợi ý bữa ăn' },
  { to: '/dishes', label: 'Món ăn' },
  { to: '/ingredients', label: 'Nguyên liệu' },
  { to: '/posts', label: 'Blogs' },
  { to: '/groceries', label: 'Mua sắm' }
];

// ingredients pie chart
export const INGREDIENT_CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)'
];

export const formatGram = n =>
  Number(n ?? 0)
    .toFixed(1)
    .replace(/\.0$/, '');

export const getOtherNutrition = nutrients => {
  const carbs = Number(nutrients?.carbs?.value ?? 0);
  const fiber = Number(nutrients?.fiber?.value ?? 0);
  return carbs + fiber;
};

export const buildNutritionPieData = nutrients => {
  const protein = Number(nutrients?.protein?.value ?? 0);
  const fat = Number(nutrients?.fat?.value ?? 0);
  const other = getOtherNutrition(nutrients);

  return [
    { name: 'Chất đạm', value: protein, fill: INGREDIENT_CHART_COLORS[0] },
    { name: 'Chất béo', value: fat, fill: INGREDIENT_CHART_COLORS[1] },
    { name: 'Khác', value: other, fill: INGREDIENT_CHART_COLORS[2] }
  ].filter(d => d.value > 0);
};

export const EMPTY_PIE_DATA = [
  { name: 'Trống', value: 1, fill: 'hsl(var(--muted))' }
];

// format date in schedule
export const formatDateVI = (date, pattern = 'EEEE, dd/MM') => {
  if (!date) return '';
  return format(new Date(date), pattern, { locale: vi });
};

// format shedule in header
export const formatScheduleTitle = (view, selectedDate) => {
  if (!selectedDate) return '...';

  if (view === 'day') {
    return format(selectedDate, 'EEEE, dd/MM', { locale: vi });
  }

  // week
  return `Tháng ${format(selectedDate, 'MM, yyyy', { locale: vi })}`;
};

// format week
export const buildWeekDaysWithSchedules = (startOfSelectedWeek, docs = []) => {
  const start =
    startOfSelectedWeek || startOfWeek(new Date(), { weekStartsOn: 1 });

  const end = endOfWeek(start, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end }).map(day => {
    const schedule = docs.find(doc => isSameDay(parseISO(doc.date), day));

    return {
      date: day,
      schedule: schedule || null
    };
  });
};

// SCHEDULE PIE CHART
export const buildScheduleNutritionPieData = nutrients => {
  const protein = Number(nutrients?.protein?.value ?? 0);
  const fat = Number(nutrients?.fat?.value ?? 0);
  const carbs = Number(nutrients?.carbs?.value ?? 0);

  return [
    {
      name: 'Chất đạm',
      value: protein,
      fill: 'var(--chart-1)'
    },
    {
      name: 'Chất béo',
      value: fat,
      fill: 'var(--chart-2)'
    },
    {
      name: 'Tinh bột',
      value: carbs,
      fill: 'var(--chart-3)'
    }
  ].filter(d => d.value > 0);
};

export const EMPTY_SCHEDULE_PIE_DATA = [
  { name: 'Trống', value: 1, fill: 'hsl(var(--muted))' }
];

// ingredient list
export const findByLabel = (arr, label) =>
  arr?.find(
    x => String(x?.label).toLowerCase() === String(label).toLowerCase()
  );

export const hasValue = x => x?.value !== undefined && x?.value !== null;

// dish nutrition content
export const formatValue = (value, unit) => {
  if (value === undefined || value === null || value === '') return '-';
  const num = Number(value);
  if (unit === 'g') return formatGram(num);
  if (unit === 'kcal') return Math.round(num).toString();
  if (['mg', 'ml', 'μg'].includes(unit))
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 2
    });

  return num.toLocaleString();
};

// dish nutrtion detail
export const findNutrientValue = (nutrition, label) =>
  nutrition?.nutrients?.find(
    n => String(n.label).toLowerCase() === String(label).toLowerCase()
  )?.value ?? 0;

export const filterNutrients = (nutrition, keywords = []) =>
  nutrition?.nutrients?.filter(n =>
    keywords.some(k => String(n.label).toLowerCase().includes(k.toLowerCase()))
  ) ?? [];

// dish list kcal (calories)
export const getNutritionValue = (dish, label) =>
  dish?.nutrition?.nutrients?.find(n => n.label === label)?.value ?? 0;
