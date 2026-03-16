export const EXERCISE_DIFFICULTY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
} as const;

export type ExerciseDifficulty =
  (typeof EXERCISE_DIFFICULTY)[keyof typeof EXERCISE_DIFFICULTY];
