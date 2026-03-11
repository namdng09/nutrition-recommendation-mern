export const ACHIEVEMENT_CATEGORY = {
  FULL_CIRCLE: 'full_circle',
  DIVERSE_PALATE: 'diverse_palate',
  SOCIAL: 'social',
  TARGET: 'target',
  GROCERY: 'grocery'
} as const;

export type AchievementCategory =
  (typeof ACHIEVEMENT_CATEGORY)[keyof typeof ACHIEVEMENT_CATEGORY];

export type AchievementDefinition = {
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
};

export const ACHIEVEMENTS = {
  // Vòng Tròn Hoàn Chỉnh — Thành thạo toàn bộ hệ sinh thái
  THE_PLANNER: {
    key: 'THE_PLANNER',
    name: 'Nhà Lên Kế Hoạch',
    description:
      'Hoàn thành thành công 5 "Vòng Tròn Hoàn Chỉnh" (Lịch → Mua sắm → Hoàn thành).',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },
  THE_DISCIPLINED: {
    key: 'THE_DISCIPLINED',
    name: 'Người Kỷ Luật',
    description: 'Hoàn thành thành công 20 "Vòng Tròn Hoàn Chỉnh".',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },
  LIFESTYLE_ARCHITECT: {
    key: 'LIFESTYLE_ARCHITECT',
    name: 'Kiến Trúc Sư Lối Sống',
    description: 'Hoàn thành thành công 50 "Vòng Tròn Hoàn Chỉnh".',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },

  // Khẩu Vị Đa Dạng — Khám phá dinh dưỡng
  INGREDIENT_EXPLORER: {
    key: 'INGREDIENT_EXPLORER',
    name: 'Nhà Thám Hiểm Nguyên Liệu',
    description:
      'Sử dụng 20 nguyên liệu độc nhất trong tất cả các bữa ăn đã ghi nhận.',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },
  VARIETY_SEEKER: {
    key: 'VARIETY_SEEKER',
    name: 'Người Tìm Kiếm Sự Đa Dạng',
    description:
      'Ghi nhận bữa ăn từ 5 danh mục món ăn khác nhau (ví dụ: Thuần chay, Keto).',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },
  NUTRITIONAL_POLYMATH: {
    key: 'NUTRITIONAL_POLYMATH',
    name: 'Chuyên Gia Dinh Dưỡng Toàn Diện',
    description:
      'Sử dụng 50 nguyên liệu độc nhất trong tất cả các bữa ăn đã ghi nhận.',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },

  // Chất Xúc Tác Cộng Đồng — Ảnh hưởng xã hội
  SPARK_OF_INTEREST: {
    key: 'SPARK_OF_INTEREST',
    name: 'Tia Sáng Hứng Khởi',
    description: 'Các bài đăng của bạn nhận được tổng cộng 50 lượt thích.',
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },
  HELPFUL_PEER: {
    key: 'HELPFUL_PEER',
    name: 'Người Bạn Hữu Ích',
    description:
      'Các bình luận của bạn trên bài đăng của người khác nhận được tổng cộng 10 lượt thích.',
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },
  COMMUNITY_BEACON: {
    key: 'COMMUNITY_BEACON',
    name: 'Ngọn Đuốc Cộng Đồng',
    description:
      'Các bài đăng của bạn nhận được tổng cộng 200 lượt thích và 50 bình luận.',
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },

  // Chuyên Gia Mục Tiêu — Kiên trì với mục tiêu
  ON_THE_MARK: {
    key: 'ON_THE_MARK',
    name: 'Đúng Mục Tiêu',
    description: 'Đạt ngưỡng macro/calo mục tiêu trong tổng cộng 7 ngày.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },
  PHASE_MASTER: {
    key: 'PHASE_MASTER',
    name: 'Bậc Thầy Giai Đoạn',
    description: 'Đạt ngưỡng macro/calo mục tiêu trong tổng cộng 30 ngày.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },
  UNYIELDING_PROGRESS: {
    key: 'UNYIELDING_PROGRESS',
    name: 'Tiến Bộ Bền Bỉ',
    description: 'Duy trì chuỗi 14 ngày liên tiếp đạt mục tiêu dinh dưỡng.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },

  // Chuyên Gia Mua Sắm — Hiệu quả trong bếp
  KITCHEN_MANAGER: {
    key: 'KITCHEN_MANAGER',
    name: 'Quản Lý Bếp',
    description: 'Hoàn thành thành công 10 danh sách mua sắm.',
    category: ACHIEVEMENT_CATEGORY.GROCERY,
    icon: ''
  },
  BULK_ORGANIZER: {
    key: 'BULK_ORGANIZER',
    name: 'Người Tổ Chức Hàng Loạt',
    description:
      'Thêm và đánh dấu hoàn thành tổng cộng 100 mục trong danh sách mua sắm.',
    category: ACHIEVEMENT_CATEGORY.GROCERY,
    icon: ''
  }
} as const satisfies Record<string, AchievementDefinition>;
