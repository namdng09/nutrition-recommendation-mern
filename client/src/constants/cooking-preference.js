export const COOKING_PREFERENCE = Object.freeze({
  CANNOT_COOK: 'Không thể nấu',
  CAN_COOK: 'Có thể nấu',
  MUST_COOK: 'Phải nấu'
});

export const COOKING_PREFERENCE_OPTIONS = [
  { value: COOKING_PREFERENCE.CANNOT_COOK, label: 'Không thể nấu' },
  { value: COOKING_PREFERENCE.CAN_COOK, label: 'Có thể nấu' },
  { value: COOKING_PREFERENCE.MUST_COOK, label: 'Phải nấu' }
];
