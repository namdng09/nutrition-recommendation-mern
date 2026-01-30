export const ACTIVITY_LEVEL = Object.freeze({
  DESK_JOB_LIGHT_EXERCISE: 'Công việc bàn giấy, vận động nhẹ',
  LIGHTLY_ACTIVE_3_4X_WEEK: 'Hoạt động nhẹ, tập luyện 3-4 lần/tuần',
  ACTIVE_DAILY_FREQUENT: 'Hoạt động hằng ngày, tập luyện thường xuyên',
  VERY_ATHLETIC: 'Rất năng động',
  EXTREMELY_ATHLETIC: 'Cực kỳ năng động'
});

export const ACTIVITY_LEVEL_OPTIONS = [
  {
    value: ACTIVITY_LEVEL.DESK_JOB_LIGHT_EXERCISE,
    label: 'Công việc bàn giấy, vận động nhẹ'
  },
  {
    value: ACTIVITY_LEVEL.LIGHTLY_ACTIVE_3_4X_WEEK,
    label: 'Hoạt động nhẹ, tập luyện 3-4 lần/tuần'
  },
  {
    value: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT,
    label: 'Hoạt động hằng ngày, tập luyện thường xuyên'
  },
  { value: ACTIVITY_LEVEL.VERY_ATHLETIC, label: 'Rất năng động' },
  { value: ACTIVITY_LEVEL.EXTREMELY_ATHLETIC, label: 'Cực kỳ năng động' }
];
