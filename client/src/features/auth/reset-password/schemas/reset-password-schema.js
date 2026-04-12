import * as yup from 'yup';

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
    )
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup
    .string()
    .min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
    .required('Vui lòng nhập xác nhận mật khẩu')
});
