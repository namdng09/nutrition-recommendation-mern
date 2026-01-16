export const PUBLIC_API_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/sign-up',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/refresh-access-token'
];

export const isPublicEndpoint = url => {
  return PUBLIC_API_ENDPOINTS.some(endpoint => url?.includes(endpoint));
};
