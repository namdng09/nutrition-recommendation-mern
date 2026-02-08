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

export const UNIT_OPTIONS = [
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)' },
  { value: 'tsp', label: 'Teaspoon (tsp)' },
  { value: 'cup', label: 'Cup' },
  { value: 'piece', label: 'Piece' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' }
];

const unitSchema = yup.object({
  value: yup.number().min(0, 'Giá trị không được âm'),
  quantity: yup.number().min(0, 'Số lượng không được âm'),
  unit: yup.string(),
  isDefault: yup.boolean()
});

const ingredientSchema = yup.object({
  ingredientId: yup.string(),
  units: yup.array().of(unitSchema).min(1, 'Phải có ít nhất 1 đơn vị')
});

const instructionSchema = yup.object({
  step: yup.number().min(1, 'Bước phải lớn hơn 0'),
  description: yup.string().min(5, 'Mô tả phải có ít nhất 5 ký tự')
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
    .optional(),
  ingredients: yup.array().of(ingredientSchema).optional(),
  instructions: yup.array().of(instructionSchema).optional(),
  preparationTime: yup
    .number()
    .min(0, 'Thời gian chuẩn bị không được âm')
    .optional(),
  cookTime: yup.number().min(0, 'Thời gian nấu không được âm').optional(),
  servings: yup.number().min(1, 'Số phần ăn phải lớn hơn 0').optional(),
  tags: yup.array().of(yup.string()).optional(),
  image: yup.mixed().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional(),
  isPublic: yup.string().oneOf(['true', 'false']).optional()
});
