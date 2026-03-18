import authClient from '~/lib/auth-client';
import { queryClient } from '~/lib/query-client';

export const logout = async () => {
  const response = await authClient.post('/api/auth/logout');
  queryClient.clear(); // Clear ALL queries to cancel in-flight requests
  return response.data;
};
