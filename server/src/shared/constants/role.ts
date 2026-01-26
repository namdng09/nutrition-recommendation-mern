export const ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  NUTRITIONIST: 'nutritionist'
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
