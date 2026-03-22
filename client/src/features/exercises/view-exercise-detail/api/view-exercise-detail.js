import { useQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const getExerciseDetail = async id => {
  const response = await apiClient.get(`/api/exercises/${id}`);
  return response.data?.data;
};

export const useExerciseDetail = (id, options = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES, id],
    queryFn: () => getExerciseDetail(id),
    enabled: !!id,
    ...options
  });
};
