import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateNutritionTarget = async data => {
  const response = await apiClient.put('/api/users/me', data);
  return response.data;
};

const calculateNutrition = async data => {
  const response = await apiClient.post('/api/users/me/nutrition-target', data);
  return response.data;
};

export const useUpdateNutritionTarget = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNutritionTarget,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};

export const useCalculateNutrition = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: calculateNutrition,
    onSuccess,
    onError
  });
};
