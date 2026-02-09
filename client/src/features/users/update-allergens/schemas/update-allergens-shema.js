import * as yup from 'yup';

import { ALLERGEN } from '~/constants/allergen';

export const updateAllergensSchema = yup.object({
  allergens: yup
    .array()
    .of(yup.string().oneOf(Object.values(ALLERGEN), 'Dị ứng không hợp lệ'))
    .optional()
});
