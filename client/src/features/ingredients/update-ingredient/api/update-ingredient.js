import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateIngredient = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'isActive') {
      formData.append(
        key,
        value === true || value === 'true' ? 'true' : 'false'
      );
    } else if (key === 'categories' || key === 'allergens' || key === 'units') {
      formData.append(key, JSON.stringify(Array.isArray(value) ? value : []));
    } else if (key === 'nutrition') {
      formData.append(key, JSON.stringify(value));
    } else if (key === 'baseUnit') {
      formData.append(key, JSON.stringify(value));
    } else if (key === 'description' || key === 'name') {
      formData.append(key, value || '');
    } else if (key !== 'image') {
      formData.append(key, value);
    }
  });

  const response = await apiClient.put(`/api/ingredients/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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
