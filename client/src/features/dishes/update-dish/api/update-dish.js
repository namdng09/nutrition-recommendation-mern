import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateDish = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields only if they exist
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined)
    formData.append('description', data.description || '');
  if (data.categories !== undefined)
    formData.append('categories', JSON.stringify(data.categories || []));
  if (data.ingredients !== undefined)
    formData.append('ingredients', JSON.stringify(data.ingredients || []));
  if (data.instructions !== undefined)
    formData.append('instructions', JSON.stringify(data.instructions || []));
  if (data.preparationTime !== undefined)
    formData.append('preparationTime', data.preparationTime?.toString() || '0');
  if (data.cookTime !== undefined)
    formData.append('cookTime', data.cookTime?.toString() || '0');
  if (data.servings !== undefined)
    formData.append('servings', data.servings?.toString() || '1');
  if (data.tags !== undefined)
    formData.append('tags', JSON.stringify(data.tags || []));
  if (data.isActive !== undefined)
    formData.append('isActive', data.isActive?.toString() || 'true');
  if (data.isPublic !== undefined)
    formData.append('isPublic', data.isPublic?.toString() || 'false');

  const response = await apiClient.put(`/api/dishes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useUpdateDish = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDish,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DISH(variables.id)
      });
      onSuccess?.(data);
    },
    onError: error => {
      onError?.(error);
    }
  });
};
