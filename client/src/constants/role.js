export const ROLE = Object.freeze({
  USER: 'user',
  NUTRITIONIST: 'nutritionist',
  ADMIN: 'admin'
});

export const ROLE_OPTIONS = [
  { value: ROLE.USER, label: 'User' },
  { value: ROLE.NUTRITIONIST, label: 'Nutritionist' },
  { value: ROLE.ADMIN, label: 'Admin' }
];
