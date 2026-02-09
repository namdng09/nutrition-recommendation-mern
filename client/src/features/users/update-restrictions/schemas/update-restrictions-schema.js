import * as yup from 'yup';

import { DIET } from '~/constants/diet';

export const updateRestrictionsSchema = yup.object({
  diet: yup
    .string()
    .oneOf(Object.values(DIET), 'Chế độ ăn không hợp lệ')
    .required('Chế độ ăn là bắt buộc')
});
