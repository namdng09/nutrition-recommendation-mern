export const buildFormData = (data, options = {}) => {
  const { exclude = [], fileFields = [] } = options;
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (exclude.includes(key)) return;
    if (value === undefined || value === null || value === '') return;

    if (fileFields.includes(key)) {
      if (value[0]) {
        formData.append(key, value[0]);
      }
      return;
    }

    formData.append(key, value);
  });

  return formData;
};
