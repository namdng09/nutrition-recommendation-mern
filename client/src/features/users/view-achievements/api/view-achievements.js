// API file: view-achievements.js
import { useSuspenseQuery } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';
import { QUERY_KEYS } from '~/lib/query-keys';

const fetchUserAchievements = async () => {
  const response = await apiClient.get('/api/achievements/me');
  return response.data.data;
};

export const useUserAchievements = () => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.ACHIEVEMENTS,
    queryFn: fetchUserAchievements
  });
};
