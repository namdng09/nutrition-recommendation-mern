export const getStoredAccessToken = () => {
  return (
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  );
};

export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
};

export const saveAccessToken = (accessToken, isRemember) => {
  if (isRemember !== undefined) {
    if (isRemember) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      sessionStorage.setItem('accessToken', accessToken);
    }
  } else {
    const wasInLocalStorage = localStorage.getItem('accessToken');
    if (wasInLocalStorage !== null) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      sessionStorage.setItem('accessToken', accessToken);
    }
  }
};
