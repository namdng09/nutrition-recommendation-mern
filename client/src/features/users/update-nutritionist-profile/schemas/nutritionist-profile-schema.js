import * as yup from 'yup';

export const nutritionistProfileSchema = yup.object({
  workplace: yup
    .string()
    .required('Nơi làm việc là bắt buộc')
    .min(2, 'Nơi làm việc phải có ít nhất 2 ký tự'),
  graduatedUniversity: yup
    .string()
    .required('Trường đại học là bắt buộc')
    .min(2, 'Trường đại học phải có ít nhất 2 ký tự'),
  professionalBio: yup
    .string()
    .max(500, 'Tiểu sử không được vượt quá 500 ký tự')
    .optional()
});
