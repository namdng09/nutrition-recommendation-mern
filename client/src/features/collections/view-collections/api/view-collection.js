import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { buildQueryParams } from '~/lib/build-query-params';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchCollections = async params => {
  const searchParams = buildQueryParams(params, ['name']);
  const response = await apiClient.get(
    `/api/collections?${searchParams.toString()}`
  );
  return response.data.data;
};

export const useCollections = (params = {}) => {
  return useSuspenseQuery({
    queryKey: [...QUERY_KEYS.COLLECTIONS, params],
    queryFn: () => fetchCollections(params)
  });
};
