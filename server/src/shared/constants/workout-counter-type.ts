export const WORKOUT_COUNTER_TYPE = {
  DISTANCE: 'Quãng đường',
  WEIGHT_AND_REPS: 'Cân nặng và số lần tập',
  DURATION: 'Thời gian'
} as const;

export type WorkoutCounterType =
  (typeof WORKOUT_COUNTER_TYPE)[keyof typeof WORKOUT_COUNTER_TYPE];

export const WORKOUT_DISTANCE_UNIT = {
  METER: 'm',
  KILOMETER: 'km'
} as const;

export type WorkoutDistanceUnit =
  (typeof WORKOUT_DISTANCE_UNIT)[keyof typeof WORKOUT_DISTANCE_UNIT];
