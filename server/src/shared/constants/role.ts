export const ROLE = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
