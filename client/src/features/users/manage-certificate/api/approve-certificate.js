import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const approveCertificate = async ({ id }) => {
  const response = await apiClient.put(`/api/users/${id}/certificate/approve`);
  return response.data;
};

export const useApproveCertificate = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCertificate,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USER(variables.id)
      });
      onSuccess?.(response);
    },
    onError
  });
};
