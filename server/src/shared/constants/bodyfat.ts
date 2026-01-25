export const BODYFAT = {
  LOW: 'Thấp',
  MEDIUM: 'Trung Bình',
  HIGH: 'CAO'
} as const;

export type Bodyfat = (typeof BODYFAT)[keyof typeof BODYFAT];
