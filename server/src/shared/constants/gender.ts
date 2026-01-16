export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
} as const;

export type Gender = (typeof GENDER)[keyof typeof GENDER];
