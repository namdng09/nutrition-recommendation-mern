export const ACHIEVEMENT_TIER = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng'
} as const;

export type AchievementTier =
  (typeof ACHIEVEMENT_TIER)[keyof typeof ACHIEVEMENT_TIER];

// Đồng: ≥1, Bạc: ≥4, Vàng: ≥9
export const ACHIEVEMENT_TIER_THRESHOLDS: Record<AchievementTier, number> = {
  [ACHIEVEMENT_TIER.BRONZE]: 1,
  [ACHIEVEMENT_TIER.SILVER]: 4,
  [ACHIEVEMENT_TIER.GOLD]: 9
};

export const ACHIEVEMENTS = {
  // Rất dễ
  FIRST_LOGIN: {
    key: 'first_login',
    name: 'Ủa, Vào Được Rồi!',
    description: 'Đăng nhập vào hệ thống lần đầu tiên'
  },

  FIRST_DISH: {
    key: 'first_dish',
    name: 'Món Này Tự Nấu Đấy',
    description: 'Tạo món ăn đầu tiên của bạn'
  },

  FIRST_MEAL_LOGGED: {
    key: 'first_meal_logged',
    name: 'Ăn Là Phải Ghi',
    description: 'Ghi lại bữa ăn đầu tiên của bạn'
  },

  FIRST_SCHEDULE: {
    key: 'first_schedule',
    name: 'Ăn Cũng Phải Có Kế Hoạch',
    description: 'Tạo lịch ăn đầu tiên'
  },

  // Dễ
  LOGIN_STREAK_7: {
    key: 'login_streak_7',
    name: 'Tuần Nào Cũng Gặp',
    description: 'Đăng nhập 7 ngày liên tiếp'
  },

  MEAL_LOGGER_10: {
    key: 'meal_logger_10',
    name: 'Không Ghi Là Quên',
    description: 'Ghi lại tổng cộng 10 bữa ăn'
  },

  DISH_CREATOR_5: {
    key: 'dish_creator_5',
    name: 'Bếp Đang Nóng Lên',
    description: 'Tạo tổng cộng 5 món ăn tự chế'
  },

  // Trung bình
  LOGIN_STREAK_14: {
    key: 'login_streak_14',
    name: 'Hai Tuần Kiên Trì',
    description: 'Đăng nhập 14 ngày liên tiếp'
  },

  MEAL_LOGGER_30: {
    key: 'meal_logger_30',
    name: 'Nhật Ký Ăn Uống',
    description: 'Ghi lại tổng cộng 30 bữa ăn'
  },

  DISH_CREATOR_10: {
    key: 'dish_creator_10',
    name: 'Chef Tập Sự',
    description: 'Tạo tổng cộng 10 món ăn tự chế'
  },

  SCHEDULE_PLANNER_10: {
    key: 'schedule_planner_10',
    name: 'Người Tính Xa',
    description: 'Tạo tổng cộng 10 lịch ăn'
  },

  // Khó
  LOGIN_STREAK_30: {
    key: 'login_streak_30',
    name: 'Ở Đây Luôn Cho Nóng',
    description: 'Đăng nhập 30 ngày liên tiếp'
  },

  MEAL_LOGGER_100: {
    key: 'meal_logger_100',
    name: 'Ăn Gì Cũng Nhớ',
    description: 'Ghi lại tổng cộng 100 bữa ăn'
  },

  DISH_CREATOR_20: {
    key: 'dish_creator_20',
    name: 'Bếp Trưởng Xuất Hiện',
    description: 'Tạo tổng cộng 20 món ăn tự chế'
  }
} as const;

export type AchievementKey =
  (typeof ACHIEVEMENTS)[keyof typeof ACHIEVEMENTS]['key'];

export const ACHIEVEMENT_KEYS = Object.values(ACHIEVEMENTS).map(
  a => a.key
) as AchievementKey[];

export function getUserTier(unlockedCount: number): AchievementTier | null {
  if (unlockedCount >= ACHIEVEMENT_TIER_THRESHOLDS[ACHIEVEMENT_TIER.GOLD])
    return ACHIEVEMENT_TIER.GOLD;
  if (unlockedCount >= ACHIEVEMENT_TIER_THRESHOLDS[ACHIEVEMENT_TIER.SILVER])
    return ACHIEVEMENT_TIER.SILVER;
  if (unlockedCount >= ACHIEVEMENT_TIER_THRESHOLDS[ACHIEVEMENT_TIER.BRONZE])
    return ACHIEVEMENT_TIER.BRONZE;
  return null;
}
