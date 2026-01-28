import * as yup from 'yup';

export const INGREDIENT_CATEGORY_OPTIONS = [
  { value: 'Rau củ', label: 'Rau củ' },
  { value: 'Trái cây', label: 'Trái cây' },
  { value: 'Ngũ cốc', label: 'Ngũ cốc' },
  { value: 'Thịt', label: 'Thịt' },
  { value: 'Gia cầm', label: 'Gia cầm' },
  { value: 'Hải sản', label: 'Hải sản' },
  { value: 'Sản phẩm từ sữa', label: 'Sản phẩm từ sữa' },
  { value: 'Trứng', label: 'Trứng' },
  { value: 'Đậu & họ đậu', label: 'Đậu & họ đậu' },
  { value: 'Hạt & hạt giống', label: 'Hạt & hạt giống' },
  { value: 'Dầu & chất béo', label: 'Dầu & chất béo' },
  { value: 'Rau thơm & gia vị', label: 'Rau thơm & gia vị' },
  { value: 'Gia vị & nước chấm', label: 'Gia vị & nước chấm' },
  { value: 'Chất tạo ngọt', label: 'Chất tạo ngọt' },
  { value: 'Đồ uống', label: 'Đồ uống' },
  { value: 'Nguyên liệu làm bánh', label: 'Nguyên liệu làm bánh' },
  { value: 'Mì & sợi', label: 'Mì & sợi' },
  { value: 'Bánh mì', label: 'Bánh mì' },
  { value: 'Đồ ăn vặt', label: 'Đồ ăn vặt' },
  { value: 'Thực phẩm đông lạnh', label: 'Thực phẩm đông lạnh' },
  { value: 'Thực phẩm đóng hộp', label: 'Thực phẩm đóng hộp' },
  { value: 'Thực phẩm bổ sung', label: 'Thực phẩm bổ sung' },
  { value: 'Khác', label: 'Khác' }
];

export const UNIT_OPTIONS = [
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)' },
  { value: 'tsp', label: 'Teaspoon (tsp)' },
  { value: 'cup', label: 'Cup' },
  { value: 'piece', label: 'Piece' }
];

const nutrientValueSchema = yup.object({
  value: yup
    .number()
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc')
});

const nutrientsSchema = yup.object({
  calories: nutrientValueSchema.optional(),
  carbs: nutrientValueSchema.optional(),
  fat: nutrientValueSchema.optional(),
  protein: nutrientValueSchema.optional(),
  fiber: nutrientValueSchema.optional(),
  sodium: nutrientValueSchema.optional(),
  cholesterol: nutrientValueSchema.optional()
});

const baseUnitSchema = yup.object({
  amount: yup
    .number()
    .min(0, 'Số lượng không được âm')
    .required('Số lượng là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc')
});

const unitSchema = yup.object({
  value: yup
    .number()
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc'),
  isDefault: yup.boolean().required('isDefault là bắt buộc')
});

export const updateIngredientSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự')
    .optional(),
  description: yup.string().optional(),
  categories: yup
    .array()
    .of(
      yup.string().oneOf(
        INGREDIENT_CATEGORY_OPTIONS.map(opt => opt.value),
        'Danh mục không hợp lệ'
      )
    )
    .optional(),
  baseUnit: baseUnitSchema.optional(),
  units: yup.array().of(unitSchema).optional(),
  allergens: yup.array().of(yup.string()).optional(),
  nutrition: yup
    .object({
      nutrients: nutrientsSchema.optional()
    })
    .optional(),
  image: yup.string().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional()
});
