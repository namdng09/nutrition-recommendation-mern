import * as yup from 'yup';

export const createCollectionSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên bộ sưu tập phải có ít nhất 2 ký tự')
    .required('Tên bộ sưu tập là bắt buộc'),
  description: yup.string().optional(),
  image: yup.mixed().optional(),
  isPublic: yup.boolean().optional().default(false),
  tags: yup.array().of(yup.string()).optional(),
  dishes: yup.array().of(yup.string()).optional()
});
