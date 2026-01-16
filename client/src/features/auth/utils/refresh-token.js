import { REFRESH_TOKEN_ERROR } from '../constants/refresh-token-error';

export const getRefreshTokenErrorCode = error => {
  if (!error.response) {
    return REFRESH_TOKEN_ERROR.NETWORK;
  }

  const { status, data } = error.response;
  const message = data?.message?.toLowerCase() || '';

  if (status === 401) {
    if (message.includes('expired')) {
      return REFRESH_TOKEN_ERROR.EXPIRED;
    }
    if (message.includes('required') || message.includes('missing')) {
      return REFRESH_TOKEN_ERROR.MISSING;
    }
    return REFRESH_TOKEN_ERROR.INVALID;
  }

  if (status === 400 && message.includes('invalid')) {
    return REFRESH_TOKEN_ERROR.INVALID;
  }

  return REFRESH_TOKEN_ERROR.UNKNOWN;
};

export const isRefreshTokenExpired = error => {
  return error?.code === REFRESH_TOKEN_ERROR.EXPIRED;
};

export const requiresReAuthentication = error => {
  return [
    REFRESH_TOKEN_ERROR.EXPIRED,
    REFRESH_TOKEN_ERROR.INVALID,
    REFRESH_TOKEN_ERROR.MISSING
  ].includes(error?.code);
};
