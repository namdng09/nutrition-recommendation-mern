import * as yup from 'yup';

import { GENDER } from '~/constants/gender';

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .optional(),
  gender: yup
    .string()
    .oneOf([...Object.values(GENDER), ''], 'Invalid gender')
    .optional(),
  dob: yup.string().optional(),
  avatar: yup
    .mixed()
    .test('fileSize', 'File size too large (max 5MB)', value => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only image files are allowed', value => {
      if (!value) return true;
      return value.type.startsWith('image/');
    })
    .optional()
});
