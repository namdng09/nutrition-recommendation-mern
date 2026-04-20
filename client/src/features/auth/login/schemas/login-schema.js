import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Sai cú pháp của email')
    .required('Vui lòng nhập email của bạn để tiếp tục'),
  password: yup.string().required('Vui lòng nhập mật khẩu của bạn để tiếp tục'),
  isRemember: yup.boolean().default(false)
});
