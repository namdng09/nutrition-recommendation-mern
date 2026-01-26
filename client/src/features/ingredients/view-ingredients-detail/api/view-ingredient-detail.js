import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchIngredientDetail = async id => {
  const response = await apiClient.get(`/api/ingredients/${id}`);
  return response.data.data;
};

export const useIngredientDetail = id => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.INGREDIENT(id),
    queryFn: () => fetchIngredientDetail(id)
  });
};
