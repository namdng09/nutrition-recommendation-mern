import { QueryClient } from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1
  }
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
