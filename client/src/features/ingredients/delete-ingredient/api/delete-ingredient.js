import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteIngredient = async id => {
  const response = await apiClient.delete(`/api/ingredients/${id}`);
  return response.data;
};

const deleteBulkIngredients = async ids => {
  const response = await apiClient.delete('/api/ingredients', {
    data: { ids }
  });
  return response.data;
};

export const useDeleteIngredient = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INGREDIENTS });
      onSuccess?.(response);
    },
    onError
  });
};

export const useDeleteBulkIngredients = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulkIngredients,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INGREDIENTS });
      onSuccess?.(response);
    },
    onError
  });
};
