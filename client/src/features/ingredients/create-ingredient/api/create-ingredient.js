import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createIngredient = async ({ data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('categories', JSON.stringify(data.categories || []));
  formData.append('baseUnit', JSON.stringify(data.baseUnit));
  formData.append('units', JSON.stringify(data.units || []));
  formData.append('allergens', JSON.stringify(data.allergens || []));
  formData.append('nutrition', JSON.stringify(data.nutrition));
  formData.append('isActive', data.isActive ? 'true' : 'false');

  const response = await apiClient.post('/api/ingredients', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const useCreateIngredient = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIngredient,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INGREDIENTS });
      onSuccess?.(response);
    },
    onError
  });
};
