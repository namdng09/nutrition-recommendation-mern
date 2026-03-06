import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const uploadCertificate = async ({ certificateName, certificate }) => {
  const formData = new FormData();
  formData.append('certificateName', certificateName);
  formData.append('certificate', certificate);

  const response = await apiClient.post('/api/users/me/certificate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const useUploadCertificate = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCertificate,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
      onSuccess?.(response);
    },
    onError
  });
};
