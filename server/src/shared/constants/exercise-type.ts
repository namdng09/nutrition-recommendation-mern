export const EXERCISE_TYPE = {
  STRENGTH: 'Sức mạnh',
  STRETCHING: 'Kéo giãn',
  POWER: 'Cường độ',
  OLYMPIC: 'Olympic',
  EXPLOSIVE: 'Bùng nổ',
  MOBILITY: 'Linh hoạt',
  DYNAMIC: 'Động',
  YOGA: 'Yoga'
} as const;

export type ExerciseType = (typeof EXERCISE_TYPE)[keyof typeof EXERCISE_TYPE];
