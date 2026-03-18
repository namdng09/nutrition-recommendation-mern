export const USER_RANK = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng'
} as const;

export type UserRank = (typeof USER_RANK)[keyof typeof USER_RANK];
