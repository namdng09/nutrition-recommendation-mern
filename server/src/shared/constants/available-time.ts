export const AVAILABLE_TIME = {
  NO_TIME: 'NO_TIME',
  LITTLE_TIME: 'LITTLE_TIME',
  SOME_TIME: 'SOME_TIME',
  MORE_TIME: 'MORE_TIME',
  LOTS_OF_TIME: 'LOTS_OF_TIME',
  NO_LIMIT: 'NO_LIMIT'
} as const;

export type AvailableTime =
  (typeof AVAILABLE_TIME)[keyof typeof AVAILABLE_TIME];
