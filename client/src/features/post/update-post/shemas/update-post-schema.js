import * as yup from 'yup';

export const updatePostSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .required('Tiêu đề là bắt buộc'),
  content: yup
    .string()
    .trim()
    .min(10, 'Nội dung phải có ít nhất 10 ký tự')
    .required('Nội dung là bắt buộc'),
  category: yup.string().required('Danh mục là bắt buộc'),
  tags: yup.array().of(yup.string().trim()).default([]),
  isPublished: yup.boolean().default(false)
});
