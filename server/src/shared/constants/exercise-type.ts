export const EXERCISE_TYPE = {
  STRENGTH: 'Strength',
  STRETCHING: 'Stretching',
  POWER: 'Power',
  OLYMPIC: 'Olympic',
  EXPLOSIVE: 'Explosive',
  MOBILITY: 'Mobility',
  DYNAMIC: 'Dynamic',
  YOGA: 'Yoga'
} as const;

export type ExerciseType = (typeof EXERCISE_TYPE)[keyof typeof EXERCISE_TYPE];
