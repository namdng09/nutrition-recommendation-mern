export const ROLE = {
  USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
  NUTRITIONIST: 'Chuyên gia dinh dưỡng'
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
