import { useMutation } from '@tanstack/react-query';

import authClient from '~/lib/auth-client';

export const login = async data => {
  const response = await authClient.post('/api/auth/login', data);
  return response.data;
};

export const useLogin = ({ onSuccess, onError } = {}) => {
  return useMutation({
    mutationFn: login,
    onSuccess,
    onError
  });
};
