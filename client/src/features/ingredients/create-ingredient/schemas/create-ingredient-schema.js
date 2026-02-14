import * as yup from 'yup';

// Import constants từ backend
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
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'μg', label: 'Microgram (μg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'kcal', label: 'Kilocalorie (kcal)' },
  { value: 'IU', label: 'International Unit (IU)' }
];

// Vitamins (aligned with backend NUTRITION_VITAMIN)
export const VITAMIN_OPTIONS = [
  { value: 'Vitamin C', label: 'Vitamin C' },
  { value: 'Vitamin B1', label: 'Vitamin B1' },
  { value: 'Vitamin B2', label: 'Vitamin B2' },
  { value: 'Vitamin PP', label: 'Vitamin PP' },
  { value: 'Vitamin B5', label: 'Vitamin B5' },
  { value: 'Vitamin B6', label: 'Vitamin B6' },
  { value: 'Folat', label: 'Folat' },
  { value: 'Vitamin B9', label: 'Vitamin B9' },
  { value: 'Vitamin H', label: 'Vitamin H' },
  { value: 'Vitamin B12', label: 'Vitamin B12' },
  { value: 'Vitamin A', label: 'Vitamin A' },
  { value: 'Vitamin D', label: 'Vitamin D' },
  { value: 'Vitamin E', label: 'Vitamin E' },
  { value: 'Vitamin K', label: 'Vitamin K' }
];

// Minerals (aligned with backend NUTRITION_MINERAL)
export const MINERAL_OPTIONS = [
  { value: 'Calci', label: 'Calci' },
  { value: 'Sắt', label: 'Sắt' },
  { value: 'Magiê', label: 'Magiê' },
  { value: 'Mangan', label: 'Mangan' },
  { value: 'Phospho', label: 'Phospho' },
  { value: 'Kali', label: 'Kali' },
  { value: 'Natri', label: 'Natri' },
  { value: 'Kẽm', label: 'Kẽm' },
  { value: 'Đồng', label: 'Đồng' },
  { value: 'Selen', label: 'Selen' }
];

// Nutrients (aligned with backend NUTRIENTS)
export const NUTRIENT_OPTIONS = [
  { value: 'Năng lượng', label: 'Năng lượng', unit: 'kcal' },
  { value: 'Nước', label: 'Nước', unit: 'g' },
  { value: 'Protein', label: 'Protein', unit: 'g' },
  { value: 'Chất béo', label: 'Chất béo', unit: 'g' },
  { value: 'Tinh bột', label: 'Tinh bột', unit: 'g' },
  { value: 'Chất xơ', label: 'Chất xơ', unit: 'g' },
  { value: 'Tro', label: 'Tro', unit: 'g' },
  { value: 'Đường', label: 'Đường', unit: 'g' },
  { value: 'Cholesterol', label: 'Cholesterol', unit: 'mg' },
  { value: 'Phytosterol', label: 'Phytosterol', unit: 'mg' }
];

// Allergens (aligned with backend ALLERGEN values)
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
  { value: 'Mù tạt', label: 'Mù tạt' },
  { value: 'Cần tây', label: 'Cần tây' },
  { value: 'Đậu lupin', label: 'Đậu lupin' },
  { value: 'Động vật thân mềm', label: 'Động vật thân mềm' },
  { value: 'Sulfite', label: 'Sulfite' },
  { value: 'Gluten', label: 'Gluten' },
  { value: 'Lúa mạch', label: 'Lúa mạch' },
  { value: 'Lúa mạch đen', label: 'Lúa mạch đen' },
  { value: 'Tôm', label: 'Tôm' },
  { value: 'Cua', label: 'Cua' },
  { value: 'Tôm hùm', label: 'Tôm hùm' },
  { value: 'Mực', label: 'Mực' },
  { value: 'Hàu', label: 'Hàu' },
  { value: 'Nghêu', label: 'Nghêu' },
  { value: 'Hạnh nhân', label: 'Hạnh nhân' },
  { value: 'Hạt điều', label: 'Hạt điều' },
  { value: 'Óc chó', label: 'Óc chó' },
  { value: 'Hạt pecan', label: 'Hạt pecan' },
  { value: 'Hạt dẻ cười', label: 'Hạt dẻ cười' },
  { value: 'Hạt phỉ', label: 'Hạt phỉ' },
  { value: 'Hạt macadamia', label: 'Hạt macadamia' },
  { value: 'Hạt brazil', label: 'Hạt brazil' },
  { value: 'Kiwi', label: 'Kiwi' },
  { value: 'Chuối', label: 'Chuối' },
  { value: 'Bơ', label: 'Bơ' },
  { value: 'Dâu tây', label: 'Dâu tây' },
  { value: 'Đào', label: 'Đào' },
  { value: 'Xoài', label: 'Xoài' },
  { value: 'Lactose', label: 'Lactose' },
  { value: 'Ngô', label: 'Ngô' },
  { value: 'Dừa', label: 'Dừa' },
  { value: 'Tỏi', label: 'Tỏi' },
  { value: 'Hành', label: 'Hành' },
  { value: 'Cà chua', label: 'Cà chua' },
  { value: 'Sô-cô-la', label: 'Sô-cô-la' },
  { value: 'Cà phê', label: 'Cà phê' }
];

// Backend chỉ có nutrients, minerals, vitamins
// Không có aminoAcids, sugars, fats, fattyAcids
export const AMINO_ACID_OPTIONS = [];
export const SUGAR_OPTIONS = [];
export const FAT_OPTIONS = [];
export const FATTY_ACID_OPTIONS = [];

const nutrientValueSchema = yup.object({
  value: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc')
});

const nutrientsSchema = yup.object({
  calories: nutrientValueSchema.required('Calories là bắt buộc'),
  carbs: nutrientValueSchema.required('Carbs là bắt buộc'),
  fat: nutrientValueSchema.required('Fat là bắt buộc'),
  protein: nutrientValueSchema.required('Protein là bắt buộc'),
  fiber: nutrientValueSchema.required('Fiber là bắt buộc'),
  sodium: nutrientValueSchema.required('Sodium là bắt buộc'),
  cholesterol: nutrientValueSchema.required('Cholesterol là bắt buộc')
});

const unitSchema = yup.object({
  value: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup
    .string()
    .min(1, 'Đơn vị là bắt buộc')
    .required('Đơn vị là bắt buộc'),
  isDefault: yup.boolean().default(false)
});

const detailedNutrientSchema = yup.object({
  label: yup.string().required(),
  value: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Giá trị không được âm')
    .nullable()
    .optional(),
  unit: yup.string().required('Đơn vị là bắt buộc')
});

export const createIngredientSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự')
    .required('Tên nguyên liệu là bắt buộc'),
  description: yup.string().optional(),
  categories: yup
    .array()
    .of(
      yup.string().oneOf(
        INGREDIENT_CATEGORY_OPTIONS.map(opt => opt.value),
        'Danh mục không hợp lệ'
      )
    )
    .min(1, 'Phải chọn ít nhất 1 danh mục')
    .required('Danh mục là bắt buộc'),
  baseUnit: yup
    .object({
      amount: yup
        .number()
        .transform((value, originalValue) => {
          return originalValue === '' ? undefined : value;
        })
        .min(0, 'Số lượng không được âm')
        .required('Số lượng là bắt buộc'),
      unit: yup.string().required('Đơn vị là bắt buộc')
    })
    .required('Base unit là bắt buộc'),
  // XÓA units validation - backend không có field này
  allergens: yup.array().of(yup.string()).optional(),
  nutrition: yup
    .object({
      nutrients: yup
        .array()
        .of(detailedNutrientSchema)
        .required('Thông tin dinh dưỡng là bắt buộc'),
      minerals: yup.array().of(detailedNutrientSchema).optional(),
      vitamins: yup.array().of(detailedNutrientSchema).optional()
    })
    .required('Thông tin dinh dưỡng là bắt buộc'),
  image: yup.mixed().optional(),
  isActive: yup.boolean().default(true).optional()
});
