import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteCollection = async id => {
  const response = await apiClient.delete(`/api/collections/${id}`);
  return response.data;
};

const deleteBulkCollections = async ids => {
  const response = await apiClient.delete('/api/collections', {
    data: { ids }
  });
  return response.data;
};

export const useDeleteCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      onSuccess?.(response);
    },
    onError
  });
};

export const useDeleteBulkCollections = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulkCollections,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      onSuccess?.(response);
    },
    onError
  });
};
