export const ACHIEVEMENT_CATEGORY = {
  STREAK: 'streak',
  DISH: 'dish',
  MEAL: 'meal',
  SCHEDULE: 'schedule'
} as const;

export type AchievementCategory =
  (typeof ACHIEVEMENT_CATEGORY)[keyof typeof ACHIEVEMENT_CATEGORY];
