export const MEMBERSHIP_LEVEL = {
  NORMAL: 'Tài khoản thường',
  VIP: 'Tài khoản VIP'
} as const;

export type MembershipLevel =
  (typeof MEMBERSHIP_LEVEL)[keyof typeof MEMBERSHIP_LEVEL];
