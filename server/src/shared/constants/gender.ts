export const GENDER = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác'
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];
