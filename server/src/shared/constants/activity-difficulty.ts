export const ACTIVITY_DIFFICULTY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
} as const;

export type ActivityDifficulty =
  (typeof ACTIVITY_DIFFICULTY)[keyof typeof ACTIVITY_DIFFICULTY];
