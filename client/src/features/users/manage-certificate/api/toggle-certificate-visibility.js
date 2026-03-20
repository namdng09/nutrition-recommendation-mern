import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const toggleCertificateVisibility = async showCertificate => {
  const response = await apiClient.put('/api/users/me/certificate/visibility', {
    showCertificate
  });
  return response.data;
};

export const useToggleCertificateVisibility = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCertificateVisibility,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
      onSuccess?.(response);
    },
    onError
  });
};
