import * as yup from 'yup';

export const updateCollectionSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên bộ sưu tập phải có ít nhất 2 ký tự')
    .optional(),
  description: yup.string().optional(),
  image: yup.mixed().optional(),
  isPublic: yup.string().oneOf(['true', 'false']).optional(),
  tags: yup.array().of(yup.string()).optional()
});
