import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateUser = async ({ id, data }) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value);
      } else if (key !== 'avatar') {
        formData.append(key, value);
      }
    }
  });

  const response = await apiClient.put(`/api/users/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const useUpdateUser = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USER(variables.id)
      });
      onSuccess?.(response);
    },
    onError
  });
};
