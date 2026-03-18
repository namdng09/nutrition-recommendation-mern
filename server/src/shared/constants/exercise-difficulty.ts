export const EXERCISE_DIFFICULTY = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao'
} as const;

export type ExerciseDifficulty =
  (typeof EXERCISE_DIFFICULTY)[keyof typeof EXERCISE_DIFFICULTY];
