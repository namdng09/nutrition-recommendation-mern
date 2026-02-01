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
  { value: 'piece', label: 'Piece' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' }
];

export const VITAMIN_OPTIONS = [
  { value: 'Vitamin A', label: 'Vitamin A' },
  { value: 'Vitamin A IU', label: 'Vitamin A IU' },
  { value: 'Vitamin B6', label: 'Vitamin B6' },
  { value: 'Vitamin B12', label: 'Vitamin B12' },
  { value: 'Vitamin C', label: 'Vitamin C' },
  { value: 'Vitamin D IU', label: 'Vitamin D IU' },
  { value: 'Vitamin D2', label: 'Vitamin D2' },
  { value: 'Vitamin D3', label: 'Vitamin D3' },
  { value: 'Vitamin E', label: 'Vitamin E' },
  { value: 'Vitamin K', label: 'Vitamin K' }
];

export const MINERAL_OPTIONS = [
  { value: 'Calcium', label: 'Calcium' },
  { value: 'Iron', label: 'Iron' },
  { value: 'Magnesium', label: 'Magnesium' },
  { value: 'Phosphorus', label: 'Phosphorus' },
  { value: 'Potassium', label: 'Potassium' },
  { value: 'Sodium', label: 'Sodium' },
  { value: 'Zinc', label: 'Zinc' }
];

export const AMINO_ACID_OPTIONS = [
  { value: 'Alanine', label: 'Alanine' },
  { value: 'Arginine', label: 'Arginine' },
  { value: 'Aspartic acid', label: 'Aspartic acid' },
  { value: 'Cystine', label: 'Cystine' },
  { value: 'Glutamic acid', label: 'Glutamic acid' },
  { value: 'Glycine', label: 'Glycine' },
  { value: 'Histidine', label: 'Histidine' },
  { value: 'Hydroxyproline', label: 'Hydroxyproline' },
  { value: 'Isoleucine', label: 'Isoleucine' },
  { value: 'Leucine', label: 'Leucine' },
  { value: 'Lysine', label: 'Lysine' },
  { value: 'Methionine', label: 'Methionine' },
  { value: 'Phenylalanine', label: 'Phenylalanine' },
  { value: 'Proline', label: 'Proline' },
  { value: 'Serine', label: 'Serine' },
  { value: 'Threonine', label: 'Threonine' },
  { value: 'Tryptophan', label: 'Tryptophan' },
  { value: 'Tyrosine', label: 'Tyrosine' },
  { value: 'Valine', label: 'Valine' }
];

const nutrientValueSchema = yup.object({
  value: yup.number().min(0, 'Giá trị không được âm'),
  unit: yup.string()
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

const unitSchema = yup.object({
  value: yup.number().min(0, 'Giá trị không được âm'),
  unit: yup.string(),
  isDefault: yup.boolean()
});

const detailedNutrientSchema = yup.object({
  label: yup.string(),
  value: yup.number().min(0, 'Giá trị không được âm'),
  unit: yup.string()
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
  baseUnit: yup
    .object({
      amount: yup.number().min(0, 'Số lượng không được âm'),
      unit: yup.string()
    })
    .optional(),
  units: yup.array().of(unitSchema).optional(),
  allergens: yup.array().of(yup.string()).optional(),
  nutrition: yup
    .object({
      nutrients: nutrientsSchema.optional(),
      minerals: yup.array().of(detailedNutrientSchema).optional(),
      vitamins: yup.array().of(detailedNutrientSchema).optional(),
      sugars: yup.array().of(detailedNutrientSchema).optional(),
      fats: yup.array().of(detailedNutrientSchema).optional(),
      fattyAcids: yup.array().of(detailedNutrientSchema).optional(),
      aminoAcids: yup.array().of(detailedNutrientSchema).optional()
    })
    .optional(),
  image: yup.string().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional()
});
