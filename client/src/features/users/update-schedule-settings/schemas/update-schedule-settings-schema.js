import * as yup from 'yup';

import { AVAILABLE_TIME } from '~/constants/available-time';
import { COOKING_PREFERENCE } from '~/constants/cooking-preference';
import { DISH_CATEGORY } from '~/constants/dish-category';
import { MEAL_COMPLEXITY } from '~/constants/meal-complexity';
import { MEAL_SIZE } from '~/constants/meal-size';
import { MEAL_TYPE } from '~/constants/meal-type';

const getEnumValues = obj => Object.values(obj);

const mealSettingSchema = yup.object({
  name: yup
    .string()
    .oneOf(getEnumValues(MEAL_TYPE), 'Loại bữa ăn không hợp lệ')
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
    .required('Cài đặt bữa ăn là bắt buộc')
});
