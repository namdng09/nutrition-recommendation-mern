import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

const calculateNutritionTarget = async data => {
  const response = await apiClient.post('/api/users/me/nutrition-target', data);
  return response.data;
};

export const useCalculateNutritionTarget = () => {
  return useMutation({
    mutationFn: calculateNutritionTarget
  });
};
