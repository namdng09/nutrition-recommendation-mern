export const GENDER = {
  MALE: 'nam',
  FEMALE: 'nữ',
  OTHER: 'khác'
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];
