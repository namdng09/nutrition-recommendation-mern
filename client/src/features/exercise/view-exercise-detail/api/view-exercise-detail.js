import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchExerciseDetail = async id => {
  const response = await apiClient.get(`/api/exercises/${id}`);
  return response.data.data;
};

export const useExerciseDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.EXERCISE(id),
    queryFn: () => fetchExerciseDetail(id)
  });
};
