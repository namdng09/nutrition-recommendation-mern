import * as yup from 'yup';

export const DISH_CATEGORY_OPTIONS = [
  { value: 'Khai vị', label: 'Khai vị' },
  { value: 'Món chính', label: 'Món chính' },
  { value: 'Món ăn kèm', label: 'Món ăn kèm' },
  { value: 'Tráng miệng', label: 'Tráng miệng' },
  { value: 'Súp', label: 'Súp' },
  { value: 'Salad', label: 'Salad' },
  { value: 'Đồ uống', label: 'Đồ uống' },
  { value: 'Bữa sáng', label: 'Bữa sáng' },
  { value: 'Ăn nhẹ', label: 'Ăn nhẹ' },
  { value: 'Nước sốt', label: 'Nước sốt' }
];

export const NUTRITION_FOCUS_OPTIONS = [
  { value: 'Giàu đạm', label: 'Giàu đạm' },
  { value: 'Ít tinh bột', label: 'Ít tinh bột' },
  { value: 'Ít béo', label: 'Ít béo' },
  { value: 'Giàu chất xơ', label: 'Giàu chất xơ' },
  { value: 'Ít muối', label: 'Ít muối' }
];

export const UNIT_OPTIONS = [
  'g',
  'kg',
  'mg',
  'μg',
  'ml',
  'l',
  'oz',
  'lb',
  'kcal',
  'IU'
];

const unitSchema = yup.object({
  quantity: yup.number().min(0, 'Số lượng không được âm').optional(),
  unit: yup.string().optional(),
  isDefault: yup.boolean().optional()
});

const ingredientSchema = yup.object({
  ingredientId: yup.string().optional(),
  units: yup
    .array()
    .of(unitSchema)
    .min(1, 'Phải có ít nhất 1 đơn vị')
    .test(
      'has-one-default',
      'Phải chọn đúng 1 đơn vị làm mặc định',
      function (value) {
        if (!value) return false;
        const defaultUnits = value.filter(unit => unit.isDefault === true);
        return defaultUnits.length === 1;
      }
    )
    .optional()
});

const instructionSchema = yup.object({
  step: yup.number().min(1, 'Bước phải lớn hơn 0').optional(),
  description: yup.string().min(5, 'Mô tả phải có ít nhất 5 ký tự').optional()
});

export const updateDishSchema = yup.object({
  name: yup.string().min(2, 'Tên món ăn phải có ít nhất 2 ký tự').optional(),
  description: yup.string().optional(),
  categories: yup
    .array()
    .of(
      yup.string().oneOf(
        DISH_CATEGORY_OPTIONS.map(opt => opt.value),
        'Danh mục không hợp lệ'
      )
    )
    .nullable()
    .transform(value => value || [])
    .default([]),
  nutritionFocus: yup
    .array()
    .of(
      yup.string().oneOf(
        NUTRITION_FOCUS_OPTIONS.map(opt => opt.value),
        'Mục tiêu dinh dưỡng không hợp lệ'
      )
    )
    .nullable()
    .transform(value => value || [])
    .default([]),
  ingredients: yup
    .array()
    .of(ingredientSchema)
    .nullable()
    .transform(value => value || [])
    .default([]),
  instructions: yup
    .array()
    .of(instructionSchema)
    .nullable()
    .transform(value => value || [])
    .default([]),
  nutrition: yup
    .object({
      nutrients: yup.object().optional(),
      minerals: yup.object().optional(),
      vitamins: yup.object().optional()
    })
    .optional(),
  preparationTime: yup
    .number()
    .min(0, 'Thời gian chuẩn bị không được âm')
    .optional(),
  cookTime: yup.number().min(0, 'Thời gian nấu không được âm').optional(),
  servings: yup.number().min(1, 'Số phần ăn phải lớn hơn 0').optional(),
  tags: yup
    .array()
    .of(yup.string())
    .nullable()
    .transform(value => value || [])
    .default([]),
  image: yup.mixed().optional(),
  isActive: yup.boolean().optional(),
  isPublic: yup.boolean().optional()
});

export const NUTRITION_UNITS = {
  // Nutrients
  'Năng lượng': 'kcal',
  Nước: 'g',
  Protein: 'g',
  'Chất béo': 'g',
  'Tinh bột': 'g',
  'Chất xơ': 'g',
  Tro: 'g',
  Đường: 'g',
  Cholesterol: 'mg',
  Phytosterol: 'mg',
  // Minerals
  Calci: 'mg',
  Sắt: 'mg',
  Magiê: 'mg',
  Mangan: 'mg',
  Phospho: 'mg',
  Kali: 'mg',
  Natri: 'mg',
  Kẽm: 'mg',
  Đồng: 'mg',
  Selen: 'μg',
  // Vitamins
  'Vitamin C': 'mg',
  'Vitamin B1': 'mg',
  'Vitamin B2': 'mg',
  'Vitamin PP': 'mg',
  'Vitamin B5': 'mg',
  'Vitamin B6': 'mg',
  Folat: 'μg',
  'Vitamin B9': 'μg',
  'Vitamin H': 'μg',
  'Vitamin B12': 'μg',
  'Vitamin A': 'μg',
  'Vitamin D': 'μg',
  'Vitamin E': 'mg',
  'Vitamin K': 'μg'
};

export const NUTRIENTS_LIST = [
  'Năng lượng',
  'Nước',
  'Protein',
  'Chất béo',
  'Tinh bột',
  'Chất xơ',
  'Tro',
  'Đường',
  'Cholesterol',
  'Phytosterol'
];

export const MINERALS_LIST = [
  'Calci',
  'Sắt',
  'Magiê',
  'Mangan',
  'Phospho',
  'Kali',
  'Natri',
  'Kẽm',
  'Đồng',
  'Selen'
];

export const VITAMINS_LIST = [
  'Vitamin C',
  'Vitamin B1',
  'Vitamin B2',
  'Vitamin PP',
  'Vitamin B5',
  'Vitamin B6',
  'Folat',
  'Vitamin B9',
  'Vitamin H',
  'Vitamin B12',
  'Vitamin A',
  'Vitamin D',
  'Vitamin E',
  'Vitamin K'
];
