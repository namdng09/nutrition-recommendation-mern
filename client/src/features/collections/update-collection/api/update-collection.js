import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateCollection = async ({ id, data, image }) => {
  const formData = new FormData();

  // Add image file if provided
  if (image instanceof File) {
    formData.append('image', image);
  }

  // Add other fields only if they exist
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined)
    formData.append('description', data.description || '');
  if (data.isPublic !== undefined)
    formData.append('isPublic', data.isPublic?.toString() || 'false');
  if (data.tags !== undefined)
    formData.append('tags', JSON.stringify(data.tags || []));

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
      onError?.(error);
    }
  });
};
