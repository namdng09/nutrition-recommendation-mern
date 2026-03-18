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

export const decodeToken = token => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getRedirectPathByRole = (role, hasOnboarded) => {
  if (role === 'Admin') {
    return '/admin';
  }
  if (role === 'Nutritionist') {
    return '/nutritionist';
  }
  return hasOnboarded ? '/' : '/onboarding';
};
