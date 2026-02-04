export const COOKING_PREFERENCE = {
  CANNOT_COOK: 'Không thể nấu',
  CAN_COOK: 'Có thể nấu',
  MUST_COOK: 'Phải nấu'
} as const;

export type CookingPreference =
  (typeof COOKING_PREFERENCE)[keyof typeof COOKING_PREFERENCE];
