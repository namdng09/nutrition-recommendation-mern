import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createCollection = async ({ data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields - match backend DTO expectations
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('isPublic', data.isPublic?.toString() || 'false');
  formData.append('tags', JSON.stringify(data.tags || []));
  formData.append('dishes', JSON.stringify(data.dishes || []));

  const response = await apiClient.post('/api/collections', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useCreateCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollection,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      onSuccess?.(data);
    },
    onError: error => {
      onError?.(error);
    }
  });
};
