export const ROLE = {
  USER: 'User',
  ADMIN: 'Admin',
  NUTRITIONIST: 'Nutritionist'
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
