import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateAllergens = async data => {
  const response = await apiClient.put('/api/users/me/allergens', data);
  return response.data;
};

export const useUpdateAllergens = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAllergens,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};
