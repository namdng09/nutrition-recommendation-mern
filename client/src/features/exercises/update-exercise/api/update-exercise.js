import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateExercise = async ({ id, data, tutorial }) => {
  const formData = new FormData();

  if (tutorial instanceof File) {
    formData.append('tutorial', tutorial);
  }

  if (data.name !== undefined) {
    formData.append('name', data.name);
  }
  if (data.instructions !== undefined) {
    formData.append('instructions', data.instructions);
  }
  if (data.difficulty !== undefined) {
    formData.append('difficulty', data.difficulty);
  }
  if (data.type !== undefined) {
    formData.append('type', data.type);
  }
  if (data.logType !== undefined) {
    formData.append('logType', data.logType);
  }
  if (data.muscles !== undefined) {
    formData.append('muscles', JSON.stringify(data.muscles || []));
  }
  if (data.equipments !== undefined) {
    formData.append('equipments', JSON.stringify(data.equipments || []));
  }
  if (data.isActive !== undefined) {
    formData.append('isActive', data.isActive?.toString());
  }

  const response = await apiClient.put(`/api/exercises/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const useUpdateExercise = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExercise,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
      onSuccess?.(response);
    },
    onError
  });
};
