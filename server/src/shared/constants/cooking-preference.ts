export const COOKING_PREFERENCE = {
  CANNOT_COOK: 'CANNOT_COOK',
  CAN_COOK: 'CAN_COOK',
  MUST_COOK: 'MUST_COOK'
} as const;

export type CookingPreference =
  (typeof COOKING_PREFERENCE)[keyof typeof COOKING_PREFERENCE];
