export const AVAILABLE_TIME = {
  NO_TIME: 'Không có thời gian (<5 phút)',
  LITTLE_TIME: 'Ít thời gian (<15 phút)',
  SOME_TIME: 'Có thời gian (<30 phút)',
  MORE_TIME: 'Nhiều thời gian (<60 phút)',
  LOTS_OF_TIME: 'Rất nhiều thời gian (<90 phút)',
  NO_LIMIT: 'Không giới hạn'
} as const;

export type AvailableTime =
  (typeof AVAILABLE_TIME)[keyof typeof AVAILABLE_TIME];
