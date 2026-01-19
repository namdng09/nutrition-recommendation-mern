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
  { to: '/playground', label: 'Playground' }
];
