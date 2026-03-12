export const WORKOUT_COUNTER_TYPE = {
  DISTANCE: 'Distance',
  WEIGHT_AND_REPS: 'WeightAndReps',
  DURATION: 'Duration'
} as const;

export type WorkoutCounterType =
  (typeof WORKOUT_COUNTER_TYPE)[keyof typeof WORKOUT_COUNTER_TYPE];

export const WORKOUT_DISTANCE_UNIT = {
  METER: 'm',
  KILOMETER: 'km'
} as const;

export type WorkoutDistanceUnit =
  (typeof WORKOUT_DISTANCE_UNIT)[keyof typeof WORKOUT_DISTANCE_UNIT];
