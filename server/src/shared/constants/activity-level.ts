export const ACTIVITY_LEVEL = {
  DESK_JOB_LIGHT_EXERCISE: 'Công việc bàn giấy, vận động nhẹ',
  LIGHTLY_ACTIVE_3_4X_WEEK: 'Hoạt động nhẹ, tập luyện 3-4 lần/tuần',
  ACTIVE_DAILY_FREQUENT: 'Hoạt động hằng ngày, tập luyện thường xuyên',
  VERY_ATHLETIC: 'Rất năng động',
  EXTREMELY_ATHLETIC: 'Cực kỳ năng động'
} as const;

export type ActivityLevel =
  (typeof ACTIVITY_LEVEL)[keyof typeof ACTIVITY_LEVEL];
