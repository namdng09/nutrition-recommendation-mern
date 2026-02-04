import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updatePhysicalStats = async data => {
  const response = await apiClient.put('/api/users/me', data);
  return response.data;
};

export const useUpdatePhysicalStats = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePhysicalStats,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};
