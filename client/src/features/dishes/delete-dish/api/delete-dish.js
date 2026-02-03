import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteDish = async id => {
  const response = await apiClient.delete(`/api/dishes/${id}`);
  return response.data;
};

const deleteBulkDishes = async ids => {
  const response = await apiClient.delete('/api/dishes', {
    data: { ids }
  });
  return response.data;
};

export const useDeleteDish = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDish,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      onSuccess?.(response);
    },
    onError
  });
};

export const useDeleteBulkDishes = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulkDishes,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISHES });
      onSuccess?.(response);
    },
    onError
  });
};
