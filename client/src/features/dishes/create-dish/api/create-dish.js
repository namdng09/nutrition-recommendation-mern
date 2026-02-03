import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createDish = async ({ data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields - match backend DTO expectations
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('categories', JSON.stringify(data.categories || []));
  formData.append('ingredients', JSON.stringify(data.ingredients || []));
  formData.append('instructions', JSON.stringify(data.instructions || []));
  formData.append('preparationTime', data.preparationTime?.toString() || '0');
  formData.append('cookTime', data.cookTime?.toString() || '0');
  formData.append('servings', data.servings?.toString() || '1');
  formData.append('tags', JSON.stringify(data.tags || []));
  formData.append('isActive', data.isActive?.toString() || 'true');
  formData.append('isPublic', data.isPublic?.toString() || 'false');

  const response = await apiClient.post('/api/dishes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useCreateDish = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDish,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      onSuccess?.(data);
    },
    onError: error => {
      onError?.(error);
    }
  });
};
