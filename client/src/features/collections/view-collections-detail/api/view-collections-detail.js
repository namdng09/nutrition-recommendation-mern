import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchCollectionDetail = async id => {
  const response = await apiClient.get(`/api/collections/${id}`);
  return response.data.data;
};

export const useCollectionDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.INGREDIENT(id),
    queryFn: () => fetchCollectionDetail(id)
  });
};
