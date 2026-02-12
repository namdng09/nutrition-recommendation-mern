import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateCollection = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Only add fields that are explicitly defined - EXCLUDE dishes
  if (data.name !== undefined && data.name !== null) {
    formData.append('name', data.name);
  }

  if (data.description !== undefined && data.description !== null) {
    formData.append('description', data.description);
  }

  if (data.isPublic !== undefined && data.isPublic !== null) {
    formData.append('isPublic', data.isPublic.toString());
  }

  if (data.tags !== undefined && data.tags !== null && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }

  // DEBUG: Log FormData
  console.log('=== FormData being sent ===');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  const response = await apiClient.put(`/api/collections/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useUpdateCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COLLECTION(variables.id)
      });
      onSuccess?.(data);
    },
    onError: error => {
      console.error('Update error:', error.response?.data || error);
      onError?.(error);
    }
  });
};
