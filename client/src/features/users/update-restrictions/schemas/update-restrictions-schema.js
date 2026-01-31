import * as yup from 'yup';

import { ALLERGEN } from '~/constants/allergen';
import { DIET } from '~/constants/diet';

export const updateRestrictionsSchema = yup.object({
  diet: yup
    .string()
    .oneOf(Object.values(DIET), 'Invalid diet')
    .required('Diet is required'),
  allergens: yup
    .array()
    .of(yup.string().oneOf(Object.values(ALLERGEN), 'Invalid allergen'))
    .optional()
});
