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
  value: yup
    .number()
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
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
