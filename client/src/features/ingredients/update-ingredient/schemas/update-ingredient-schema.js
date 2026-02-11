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
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'μg', label: 'Microgram (μg)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'kcal', label: 'Kilocalorie (kcal)' },
  { value: 'IU', label: 'International Unit (IU)' }
];

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

export const MINERAL_OPTIONS = [
  { value: 'Calci', label: 'Calci' },
  { value: 'Såt', label: 'Såt' },
  { value: 'Magiê', label: 'Magiê' },
  { value: 'Mangan', label: 'Mangan' },
  { value: 'Phospho', label: 'Phospho' },
  { value: 'Kali', label: 'Kali' },
  { value: 'Natri', label: 'Natri' },
  { value: 'Kẽm', label: 'Kẽm' },
  { value: 'Đồng', label: 'Đồng' },
  { value: 'Selen', label: 'Selen' }
];

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

// XÓA các options không có trong backend
export const AMINO_ACID_OPTIONS = [];
export const SUGAR_OPTIONS = [];
export const FAT_OPTIONS = [];
export const FATTY_ACID_OPTIONS = [];

const detailedNutrientSchema = yup.object({
  label: yup.string().optional(),
  value: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .min(0, 'Giá trị không được âm')
    .nullable()
    .optional(),
  unit: yup.string().optional()
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
      amount: yup
        .number()
        .transform((value, originalValue) => {
          return originalValue === '' ? undefined : value;
        })
        .min(0, 'Số lượng không được âm')
        .optional(),
      unit: yup.string().optional()
    })
    .optional(),
  // XÓA units validation
  allergens: yup.array().of(yup.string()).optional(),
  nutrition: yup
    .object({
      // Chỉ giữ lại nutrients, minerals, vitamins
      nutrients: yup.array().of(detailedNutrientSchema).optional(),
      minerals: yup.array().of(detailedNutrientSchema).optional(),
      vitamins: yup.array().of(detailedNutrientSchema).optional()
      // XÓA sugars, fats, fattyAcids, aminoAcids
    })
    .optional(),
  image: yup.string().optional(),
  isActive: yup.string().oneOf(['true', 'false']).optional()
});
