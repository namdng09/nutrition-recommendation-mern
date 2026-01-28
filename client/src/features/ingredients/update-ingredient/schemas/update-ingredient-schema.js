import * as yup from 'yup';

const CATEGORY_OPTIONS = [
  { value: 'Meat', label: 'Thịt' },
  { value: 'Vegetable', label: 'Rau' },
  { value: 'Fruit', label: 'Trái cây' },
  { value: 'Grain', label: 'Ngũ cốc' },
  { value: 'Dairy', label: 'Sữa' },
  { value: 'Seafood', label: 'Hải sản' },
  { value: 'Other', label: 'Khác' }
];

export const updateIngredientSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự')
    .optional(),
  category: yup
    .string()
    .oneOf(
      CATEGORY_OPTIONS.map(option => option.value),
      'Danh mục không hợp lệ'
    )
    .optional(),
  unit: yup.string().optional(),
  caloriesPer100g: yup
    .number()
    .typeError('Calories phải là số')
    .min(0, 'Calories không được âm')
    .optional(),
  protein: yup
    .number()
    .typeError('Protein phải là số')
    .min(0, 'Protein không được âm')
    .optional(),
  carbs: yup
    .number()
    .typeError('Carbs phải là số')
    .min(0, 'Carbs không được âm')
    .optional(),
  fat: yup
    .number()
    .typeError('Fat phải là số')
    .min(0, 'Fat không được âm')
    .optional(),
  fiber: yup
    .number()
    .typeError('Fiber phải là số')
    .min(0, 'Fiber không được âm')
    .optional(),
  image: yup.string().url('URL hình ảnh không hợp lệ').optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional()
});
