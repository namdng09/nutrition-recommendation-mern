import { useCallback } from 'react';

import { navigateToOAuth } from '~/lib/oauth-utils';

export const useOAuth = () => {
  const navigateToProvider = useCallback(provider => {
    const authPath = `/api/auth/${provider}`;
    navigateToOAuth(authPath);
  }, []);

  return { navigateToProvider };
};
