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
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)' },
  { value: 'tsp', label: 'Teaspoon (tsp)' },
  { value: 'cup', label: 'Cup' },
  { value: 'piece', label: 'Piece' },
  { value: 'whole', label: 'Whole' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'μg', label: 'Microgram (μg)' },
  { value: 'IU', label: 'International Unit (IU)' }
];

// Vitamins từ backend
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

// Minerals từ backend
export const MINERAL_OPTIONS = [
  { value: 'Alpha carotene', label: 'Alpha carotene' },
  { value: 'Beta carotene', label: 'Beta carotene' },
  { value: 'Caffeine', label: 'Caffeine' },
  { value: 'Choline', label: 'Choline' },
  { value: 'Copper', label: 'Copper' },
  { value: 'Fluoride', label: 'Fluoride' },
  { value: 'Folate (B9)', label: 'Folate (B9)' },
  { value: 'Lycopene', label: 'Lycopene' },
  { value: 'Magnesium', label: 'Magnesium' },
  { value: 'Manganese', label: 'Manganese' },
  { value: 'Niacin', label: 'Niacin' },
  { value: 'Pantothenic acid', label: 'Pantothenic acid' },
  { value: 'Phosphorus', label: 'Phosphorus' },
  { value: 'Retinol', label: 'Retinol' },
  { value: 'Riboflavin (B2)', label: 'Riboflavin (B2)' },
  { value: 'Selenium', label: 'Selenium' },
  { value: 'Theobromine', label: 'Theobromine' },
  { value: 'Thiamine', label: 'Thiamine' },
  { value: 'Zinc', label: 'Zinc' }
];

// Amino Acids từ backend
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

// Sugars từ backend
export const SUGAR_OPTIONS = [
  { value: 'Sugar', label: 'Sugar (Tổng đường)' },
  { value: 'Sucrose', label: 'Sucrose (Đường mía)' },
  { value: 'Glucose', label: 'Glucose (Đường nho)' },
  { value: 'Fructose', label: 'Fructose (Đường trái cây)' },
  { value: 'Lactose', label: 'Lactose (Đường sữa)' },
  { value: 'Maltose', label: 'Maltose (Đường mạch nha)' },
  { value: 'Galactose', label: 'Galactose' },
  { value: 'Starch', label: 'Starch (Tinh bột)' }
];

// Fats từ backend
export const FAT_OPTIONS = [
  { value: 'Saturated fats', label: 'Saturated fats (Chất béo bão hòa)' },
  {
    value: 'Monounsaturated fats',
    label: 'Monounsaturated fats (Chất béo không bão hòa đơn)'
  },
  {
    value: 'Polyunsaturated fats',
    label: 'Polyunsaturated fats (Chất béo không bão hòa đa)'
  },
  { value: 'Trans fats', label: 'Trans fats (Chất béo chuyển hóa)' }
];

// Fatty Acids từ backend
export const FATTY_ACID_OPTIONS = [
  { value: 'Total omega 3', label: 'Total omega 3 (Tổng omega 3)' },
  { value: 'Total omega 6', label: 'Total omega 6 (Tổng omega 6)' },
  { value: 'Alpha Linolenic Acid (ALA)', label: 'Alpha Linolenic Acid (ALA)' },
  { value: 'Docosahexaenoic Acid (DHA)', label: 'Docosahexaenoic Acid (DHA)' },
  {
    value: 'Eicosapentaenoic Acid (EPA)',
    label: 'Eicosapentaenoic Acid (EPA)'
  },
  { value: 'Docosapentaenoic Acid (DPA)', label: 'Docosapentaenoic Acid (DPA)' }
];

const nutrientValueSchema = yup.object({
  value: yup
    .number()
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc')
});

const nutrientsSchema = yup.object({
  calories: nutrientValueSchema.required('Calories là bắt buộc'),
  carbs: nutrientValueSchema.required('Carbs là bắt buộc'),
  fat: nutrientValueSchema.required('Fat là bắt buộc'),
  protein: nutrientValueSchema.required('Protein là bắt buộc'),
  fiber: nutrientValueSchema.optional(),
  sodium: nutrientValueSchema.optional(),
  cholesterol: nutrientValueSchema.optional()
});

const unitSchema = yup.object({
  value: yup
    .number()
    .min(0, 'Giá trị không được âm')
    .required('Giá trị là bắt buộc'),
  unit: yup.string().required('Đơn vị là bắt buộc'),
  isDefault: yup.boolean().required('isDefault là bắt buộc')
});

const detailedNutrientSchema = yup.object({
  label: yup.string().required(),
  value: yup.number().min(0, 'Giá trị không được âm'),
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
        .min(0, 'Số lượng không được âm')
        .required('Số lượng là bắt buộc'),
      unit: yup.string().required('Đơn vị là bắt buộc')
    })
    .required('Base unit là bắt buộc'),
  units: yup
    .array()
    .of(unitSchema)
    .min(1, 'Phải có ít nhất 1 kích thước phần ăn')
    .test(
      'has-default',
      'Phải chọn 1 kích thước phần ăn làm mặc định',
      function (value) {
        return value && value.some(unit => unit.isDefault === true);
      }
    )
    .required('Kích thước phần ăn là bắt buộc'),
  allergens: yup.array().of(yup.string()).optional(),
  nutrition: yup
    .object({
      nutrients: nutrientsSchema.required('Thông tin dinh dưỡng là bắt buộc'),
      minerals: yup.array().of(detailedNutrientSchema).optional(),
      vitamins: yup.array().of(detailedNutrientSchema).optional(),
      sugars: yup.array().of(detailedNutrientSchema).optional(),
      fats: yup.array().of(detailedNutrientSchema).optional(),
      fattyAcids: yup.array().of(detailedNutrientSchema).optional(),
      aminoAcids: yup.array().of(detailedNutrientSchema).optional()
    })
    .required('Thông tin dinh dưỡng là bắt buộc'),
  image: yup.mixed().optional(),
  isActive: yup.boolean().optional()
});
