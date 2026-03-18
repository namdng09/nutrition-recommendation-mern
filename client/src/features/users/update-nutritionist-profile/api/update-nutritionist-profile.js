import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateNutritionistProfile = async data => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  const response = await apiClient.put(
    '/api/users/me/nutritionist-profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const useUpdateNutritionistProfile = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNutritionistProfile,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};
