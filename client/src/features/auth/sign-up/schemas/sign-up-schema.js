import * as yup from 'yup';

export const signUpSchema = yup.object({
  email: yup
    .string()
    .email('Sai định dạng email')
    .required('Vui lòng nhập email của bạn để tiếp tục'),
  name: yup.string().min(1, 'Tên là bắt buộc').required('Tên là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
  avatar: yup
    .mixed()
    .test('fileSize', 'Dung lượng file quá lớn (tối đa 5MB)', value => {
      if (!value || !value[0]) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Chỉ cho phép file hình ảnh', value => {
      if (!value || !value[0]) return true;
      return value[0].type.startsWith('image/');
    })
});
