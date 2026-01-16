import { useMutation } from '@tanstack/react-query';

import apiClient from '~/lib/api-client';

export const resetPassword = async ({ token, ...data }) => {
  const response = await apiClient.post(
    `/api/auth/reset-password?token=${token}`,
    data
  );
  return response.data;
};

export const useResetPassword = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess,
    onError
  });
};
