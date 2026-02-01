import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const addDishesToCollection = async ({ id, dishIds }) => {
  const response = await apiClient.post(`/api/collections/${id}/dishes`, {
    dishIds
  });
  return response.data;
};

const removeDishesFromCollection = async ({ id, dishIds }) => {
  const response = await apiClient.delete(`/api/collections/${id}/dishes`, {
    data: { dishIds }
  });
  return response.data;
};

export const useAddDishesToCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDishesToCollection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COLLECTION(variables.id)
      });
      onSuccess?.(data);
    },
    onError
  });
};

export const useRemoveDishesFromCollection = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeDishesFromCollection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COLLECTIONS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COLLECTION(variables.id)
      });
      onSuccess?.(data);
    },
    onError
  });
};
