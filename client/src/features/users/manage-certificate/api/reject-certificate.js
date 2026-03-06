import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const rejectCertificate = async ({ id, rejectionReason }) => {
  const response = await apiClient.put(`/api/users/${id}/certificate/reject`, {
    rejectionReason
  });
  return response.data;
};

export const useRejectCertificate = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectCertificate,
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
