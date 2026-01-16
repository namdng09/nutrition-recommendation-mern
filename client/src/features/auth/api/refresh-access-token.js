import axios from 'axios';

import { REFRESH_TOKEN_ERROR } from '../constants/refresh-token-error';
import { getRefreshTokenErrorCode } from '../utils/refresh-token';

const refreshTokenClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true
});

export const refreshAccessToken = async () => {
  try {
    const response = await refreshTokenClient.post(
      '/api/auth/refresh-access-token'
    );

    const { status, message, data } = response.data;

    if (status === 'success' && data?.accessToken) {
      return {
        accessToken: data.accessToken,
        message
      };
    }

    throw {
      code: REFRESH_TOKEN_ERROR.UNKNOWN,
      message: message || 'Failed to refresh access token'
    };
  } catch (error) {
    if (error.code && Object.values(REFRESH_TOKEN_ERROR).includes(error.code)) {
      throw error;
    }

    const code = getRefreshTokenErrorCode(error);
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to refresh access token';

    throw {
      code,
      message,
      isRefreshTokenError: true
    };
  }
};
