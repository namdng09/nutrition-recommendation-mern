import * as yup from 'yup';

import { AVAILABLE_TIME } from '~/constants/available-time';
import { COOKING_PREFERENCE } from '~/constants/cooking-preference';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { MEAL_COMPLEXITY } from '~/constants/meal-complexity';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE } from '~/constants/meal-type';

const getEnumValues = obj => Object.values(obj);
const scheduleMealTypes = getEnumValues(MEAL_TYPE).filter(
  mealType => mealType !== MEAL_TYPE.ALL
);

const mealSettingSchema = yup.object({
  name: yup
    .string()
    .oneOf(scheduleMealTypes, 'Loại bữa ăn không hợp lệ')
    .required('Loại bữa ăn là bắt buộc'),
  dishCategories: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(getEnumValues(DISH_CATEGORY), 'Danh mục món ăn không hợp lệ')
    )
    .min(1, 'Phải chọn ít nhất một danh mục món ăn')
    .required('Danh mục món ăn là bắt buộc'),
  cookingPreference: yup
    .string()
    .oneOf(getEnumValues(COOKING_PREFERENCE), 'Sở thích nấu ăn không hợp lệ')
    .required('Sở thích nấu ăn là bắt buộc'),
  mealSize: yup
    .string()
    .oneOf(getEnumValues(MEAL_SIZE), 'Kích thước bữa ăn không hợp lệ')
    .required('Kích thước bữa ăn là bắt buộc'),
  availableTime: yup
    .string()
    .oneOf(getEnumValues(AVAILABLE_TIME), 'Thời gian sẵn có không hợp lệ')
    .required('Thời gian sẵn có là bắt buộc'),
  complexity: yup
    .string()
    .oneOf(getEnumValues(MEAL_COMPLEXITY), 'Độ phức tạp không hợp lệ')
    .required('Độ phức tạp là bắt buộc')
});

export const updateScheduleSettingsSchema = yup.object({
  mealSettings: yup
    .array()
    .of(mealSettingSchema)
    .min(1, 'Phải có ít nhất một bữa ăn')
    .max(10, 'Chỉ được có tối đa 10 bữa ăn')
    .required('Cài đặt bữa ăn là bắt buộc')
    .test(
      'unique-meal-types',
      'Mỗi loại bữa ăn chỉ nên xuất hiện một lần',
      mealSettings => {
        if (!mealSettings || mealSettings.length === 0) {
          return true;
        }

        const mealTypeCount = new Set(mealSettings.map(item => item.name)).size;
        return mealTypeCount === mealSettings.length;
      }
    )
});
