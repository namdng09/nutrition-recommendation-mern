import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteExercise = async id => {
  const response = await apiClient.delete(`/api/exercises/${id}`);
  return response.data;
};

const deleteBulkExercises = async ids => {
  const response = await apiClient.delete('/api/exercises', {
    data: { ids }
  });
  return response.data;
};

export const useDeleteExercise = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
      onSuccess?.(response);
    },
    onError
  });
};

export const useDeleteBulkExercises = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulkExercises,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
      onSuccess?.(response);
    },
    onError
  });
};
