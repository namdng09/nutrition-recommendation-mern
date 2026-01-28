import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateIngredient = async ({ id, data }) => {
  const payload = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convert string numbers to actual numbers for nutritional values
      if (
        ['caloriesPer100g', 'protein', 'carbs', 'fat', 'fiber'].includes(key)
      ) {
        payload[key] = Number(value);
      } else if (key === 'isActive') {
        payload[key] = value === 'true';
      } else {
        payload[key] = value;
      }
    }
  });

  const response = await apiClient.put(`/api/ingredients/${id}`, payload);
  return response.data;
};

export const useUpdateIngredient = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIngredient,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INGREDIENTS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INGREDIENT(variables.id)
      });
      onSuccess?.(response);
    },
    onError
  });
};
