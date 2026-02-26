/**
 * Build OAuth URL based on environment configuration
 * @param {string} authPath - The OAuth endpoint path (e.g., '/api/auth/google')
 * @param {string} [apiUrl] - Optional API URL (defaults to VITE_API_URL env var)
 * @returns {string} The full OAuth URL or relative path
 */
export const buildOAuthUrl = (
  authPath,
  apiUrl = import.meta.env.VITE_API_URL
) => {
  if (apiUrl?.startsWith('http')) {
    return `${apiUrl}${authPath}`;
  }
  return authPath;
};

export const navigateToOAuth = authPath => {
  const oauthUrl = buildOAuthUrl(authPath);
  window.location.href = oauthUrl;
};
