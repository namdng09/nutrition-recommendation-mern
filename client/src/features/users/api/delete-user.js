import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const deleteUser = async id => {
  const response = await apiClient.delete(`/api/users/${id}`);
  return response.data;
};

const deleteBulkUsers = async ids => {
  const response = await apiClient.delete('/api/users', {
    data: { ids }
  });
  return response.data;
};

export const useDeleteUser = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      onSuccess?.(response);
    },
    onError
  });
};

export const useDeleteBulkUsers = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulkUsers,
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      onSuccess?.(response);
    },
    onError
  });
};
