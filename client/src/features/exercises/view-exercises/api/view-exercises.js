import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchExercises = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/exercises?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useExercises = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.EXERCISES, params],
    queryFn: () => fetchExercises(params)
  });
};
