import * as yup from 'yup';

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Sai định dạng email')
    .required('Vui lòng nhập email')
});
