import { clsx } from 'clsx';
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
  { to: '/collections', label: 'Gợi ý bữa ăn' },
  { to: '/dishes', label: 'Danh sách món ăn' },
  { to: '/ingredients', label: 'Danh sách nguyên liệu' }
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
  return Math.max(0, carbs + fiber);
};

export const buildNutritionPieData = nutrients => {
  const protein = Number(nutrients?.protein?.value ?? 0);
  const fat = Number(nutrients?.fat?.value ?? 0);
  const other = getOtherNutrition(nutrients);

  return [
    {
      name: 'Chất đạm',
      value: protein,
      fill: INGREDIENT_CHART_COLORS[0]
    },
    {
      name: 'Chất béo',
      value: fat,
      fill: INGREDIENT_CHART_COLORS[1]
    },
    {
      name: 'Khác',
      value: other,
      fill: INGREDIENT_CHART_COLORS[2]
    }
  ].filter(d => d.value > 0);
};

export const EMPTY_PIE_DATA = [
  { name: 'Trống', value: 1, fill: 'hsl(var(--muted))' }
];
