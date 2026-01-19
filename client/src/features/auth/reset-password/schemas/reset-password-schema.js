import * as yup from 'yup';

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup
    .string()
    .min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
    .required('Vui lòng nhập xác nhận mật khẩu')
});
