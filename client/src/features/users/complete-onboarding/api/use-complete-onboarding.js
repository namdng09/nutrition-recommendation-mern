import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

const completeOnboarding = async data => {
  const response = await apiClient.post('/api/users/me/onboarding', data);
  return response.data;
};

export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: completeOnboarding
  });
};
