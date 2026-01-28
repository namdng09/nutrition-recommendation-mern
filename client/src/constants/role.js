export const ROLE = Object.freeze({
  USER: 'Người dùng',
  NUTRITIONIST: 'Chuyên gia dinh dưỡng',
  ADMIN: 'Quản trị viên'
});

export const ROLE_OPTIONS = [
  { value: ROLE.USER, label: 'User' },
  { value: ROLE.NUTRITIONIST, label: 'Nutritionist' },
  { value: ROLE.ADMIN, label: 'Admin' }
];
