import * as yup from 'yup';

const reUploadSchema = yup.object({
  certificateName: yup.string().required('Vui lòng nhập tên chứng chỉ'),
  certificate: yup
    .mixed()
    .required('Vui lòng chọn tệp chứng chỉ')
    .test('fileRequired', 'Vui lòng chọn tệp chứng chỉ', value => {
      return value && value[0] instanceof File;
    })
    .test('fileSize', 'Tệp không được vượt quá 10MB', value => {
      if (!value || !value[0]) return true;
      return value[0].size <= 10 * 1024 * 1024;
    })
    .test('fileType', 'Chỉ chấp nhận ảnh hoặc PDF', value => {
      if (!value || !value[0]) return true;
      return (
        value[0].type.startsWith('image/') ||
        value[0].type === 'application/pdf'
      );
    })
});

export default reUploadSchema;
