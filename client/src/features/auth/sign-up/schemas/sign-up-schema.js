import * as yup from 'yup';

const baseSignUpSchema = {
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
};

export const userSignUpSchema = yup.object(baseSignUpSchema);

export const nutritionistSignUpSchema = yup.object({
  ...baseSignUpSchema,
  certificateName: yup.string().required('Vui lòng nhập tên chứng chỉ'),
  certificate: yup
    .mixed()
    .required('Vui lòng tải lên chứng chỉ của bạn')
    .test('fileSize', 'Dung lượng file quá lớn (tối đa 10MB)', value => {
      if (!value || !value[0]) return false;
      return value[0].size <= 10 * 1024 * 1024;
    })
    .test('fileType', 'Chỉ cho phép file hình ảnh hoặc PDF', value => {
      if (!value || !value[0]) return false;
      return (
        value[0].type.startsWith('image/') ||
        value[0].type === 'application/pdf'
      );
    }),
  workplace: yup.string().optional(),
  graduatedUniversity: yup.string().optional(),
  professionalBio: yup
    .string()
    .max(500, 'Tiểu sử không được vượt quá 500 ký tự')
    .optional()
});

// Keep legacy export for backwards compatibility
export const signUpSchema = userSignUpSchema;
