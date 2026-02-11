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

// Updated to match backend constants
export const NUTRITION_FOCUS_OPTIONS = [
  { value: 'Giàu đạm', label: 'Giàu đạm' },
  { value: 'Ít tinh bột', label: 'Ít tinh bột' },
  { value: 'Ít béo', label: 'Ít béo' },
  { value: 'Giàu chất xơ', label: 'Giàu chất xơ' },
  { value: 'Ít muối', label: 'Ít muối' }
];

// Allergen options from backend
export const ALLERGEN_OPTIONS = [
  { value: 'Sữa', label: 'Sữa' },
  { value: 'Trứng', label: 'Trứng' },
  { value: 'Cá', label: 'Cá' },
  { value: 'Hải sản có vỏ', label: 'Hải sản có vỏ' },
  { value: 'Hạt cây', label: 'Hạt cây' },
  { value: 'Đậu phộng', label: 'Đậu phộng' },
  { value: 'Lúa mì', label: 'Lúa mì' },
  { value: 'Đậu nành', label: 'Đậu nành' },
  { value: 'Mè', label: 'Mè' },
  { value: 'Gluten', label: 'Gluten' },
  { value: 'Tôm', label: 'Tôm' },
  { value: 'Cua', label: 'Cua' },
  { value: 'Mực', label: 'Mực' },
  { value: 'Hạnh nhân', label: 'Hạnh nhân' },
  { value: 'Hạt điều', label: 'Hạt điều' },
  { value: 'Lactose', label: 'Lactose' },
  { value: 'Ngô', label: 'Ngô' },
  { value: 'Dừa', label: 'Dừa' }
];

// Backend unit constants
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
  quantity: yup
    .number()
    .min(0, 'Số lượng không được âm')
    .required('Số lượng là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc'),
  isDefault: yup.boolean().required('isDefault là bắt buộc')
});

const ingredientSchema = yup.object({
  ingredientId: yup.string().required('Nguyên liệu là bắt buộc'),
  units: yup
    .array()
    .of(unitSchema)
    .min(1, 'Phải có ít nhất 1 đơn vị')
    .test('has-gram', 'Phải có đơn vị gram (g)', function (value) {
      return value && value.some(unit => unit.unit === 'g');
    })
    .test('has-default', 'Phải chọn 1 đơn vị làm mặc định', function (value) {
      return value && value.some(unit => unit.isDefault === true);
    })
    .required('Đơn vị là bắt buộc')
});

const instructionSchema = yup.object({
  step: yup.number().min(1, 'Bước phải lớn hơn 0').required('Bước là bắt buộc'),
  description: yup
    .string()
    .min(5, 'Mô tả phải có ít nhất 5 ký tự')
    .required('Mô tả là bắt buộc')
});

// Nutrition schemas - array format matching backend
const nutrientItemSchema = yup.object({
  label: yup
    .string()
    .oneOf([
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
    ])
    .required(),
  value: yup.number().min(0).required(),
  unit: yup.string().oneOf(UNIT_OPTIONS).required()
});

const mineralItemSchema = yup.object({
  label: yup
    .string()
    .oneOf([
      'Calci',
      'Sắt', // Note: Backend has typo "Såt" instead of "Sắt"
      'Magiê',
      'Mangan',
      'Phospho',
      'Kali',
      'Natri',
      'Kẽm',
      'Đồng',
      'Selen'
    ])
    .required(),
  value: yup.number().min(0).required(),
  unit: yup.string().oneOf(UNIT_OPTIONS).required()
});

const vitaminItemSchema = yup.object({
  label: yup
    .string()
    .oneOf([
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
    ])
    .required(),
  value: yup.number().min(0).required(),
  unit: yup.string().oneOf(UNIT_OPTIONS).required()
});

const nutritionSchema = yup.object({
  nutrients: yup.array().of(nutrientItemSchema).optional(),
  minerals: yup.array().of(mineralItemSchema).optional(),
  vitamins: yup.array().of(vitaminItemSchema).optional()
});

export const createDishSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên món ăn phải có ít nhất 2 ký tự')
    .required('Tên món ăn là bắt buộc'),
  description: yup.string().optional(),
  categories: yup
    .array()
    .of(
      yup.string().oneOf(
        DISH_CATEGORY_OPTIONS.map(opt => opt.value),
        'Danh mục không hợp lệ'
      )
    )
    .min(1, 'Phải chọn ít nhất 1 danh mục')
    .required('Danh mục là bắt buộc'),
  nutritionFocus: yup
    .array()
    .of(
      yup.string().oneOf(
        NUTRITION_FOCUS_OPTIONS.map(opt => opt.value),
        'Mục tiêu dinh dưỡng không hợp lệ'
      )
    )
    .min(1, 'Phải chọn ít nhất 1 mục tiêu dinh dưỡng')
    .required('Mục tiêu dinh dưỡng là bắt buộc'),
  ingredients: yup
    .array()
    .of(ingredientSchema)
    .min(1, 'Phải có ít nhất 1 nguyên liệu')
    .required('Nguyên liệu là bắt buộc'),
  instructions: yup
    .array()
    .of(instructionSchema)
    .min(1, 'Phải có ít nhất 1 bước hướng dẫn')
    .required('Hướng dẫn nấu là bắt buộc'),
  nutrition: nutritionSchema.optional(),
  preparationTime: yup
    .number()
    .min(0, 'Thời gian chuẩn bị không được âm')
    .optional(),
  cookTime: yup.number().min(0, 'Thời gian nấu không được âm').optional(),
  servings: yup
    .number()
    .min(1, 'Số phần ăn phải lớn hơn 0')
    .optional()
    .default(1),
  tags: yup.array().of(yup.string()).optional(),
  image: yup.mixed().optional(),
  isActive: yup.boolean().optional().default(true),
  isPublic: yup.boolean().optional().default(false)
});

// Helper to get unit for nutrients/minerals/vitamins - MUST match backend units
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
  // Minerals - Note: Backend has "Såt" not "Sắt"
  Calci: 'mg',
  Såt: 'mg',
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

// For UI display purposes
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
  'Sắt', // Backend typo
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
