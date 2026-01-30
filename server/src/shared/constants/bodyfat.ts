export const BODYFAT = {
  LOW: 'Thấp',
  MEDIUM: 'Trung Bình',
  HIGH: 'Cao'
} as const;

export type Bodyfat = (typeof BODYFAT)[keyof typeof BODYFAT];
