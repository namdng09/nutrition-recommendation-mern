import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const createExercise = async ({ data, tutorial }) => {
  const formData = new FormData();

  if (tutorial instanceof File) {
    formData.append('tutorial', tutorial);
  }

  formData.append('name', data.name);
  formData.append('instructions', data.instructions);
  formData.append('difficulty', data.difficulty);
  formData.append('type', data.type);
  formData.append('logType', data.logType);
  formData.append('muscles', JSON.stringify(data.muscles || []));
  formData.append('equipments', JSON.stringify(data.equipments || []));
  formData.append('isActive', data.isActive?.toString() || 'true');

  const response = await apiClient.post('/api/exercises', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useCreateExercise = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExercise,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
      onSuccess?.(data);
    },
    onError: error => {
      onError?.(error);
    }
  });
};
