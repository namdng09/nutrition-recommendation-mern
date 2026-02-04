import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const updateScheduleSettings = async data => {
  const response = await apiClient.put('/api/users/me', data);
  return response.data;
};

export const useUpdateScheduleSettings = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScheduleSettings,
    onSuccess: response => {
      queryClient.setQueryData(QUERY_KEYS.PROFILE, response.data);
      onSuccess?.(response);
    },
    onError
  });
};
