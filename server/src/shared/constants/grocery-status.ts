export const GROCERY_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

export type GroceryStatus =
  (typeof GROCERY_STATUS)[keyof typeof GROCERY_STATUS];
