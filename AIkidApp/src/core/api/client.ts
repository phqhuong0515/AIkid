import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  clearAccessToken,
  getAccessToken,
  getAccessTokenSync,
} from '../auth/token';
import { notifySessionInvalidated } from '../auth/sessionEvents';
import { GATEWAY_BASE_URL } from './config';

export { GATEWAY_BASE_URL } from './config';

/**
 * Optional child profile header (family mode).
 * Family store registers resolver when ported; default null.
 */
let childProfileIdResolver: () => string | null = () => null;

export function setChildProfileIdResolver(fn: () => string | null): void {
  childProfileIdResolver = fn;
}

/** Axios transport for the SDK. Consumer traffic is always `/api/v1/*`. */
export const apiClient = axios.create({
  baseURL: GATEWAY_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let isHandlingUnauthorized = false;

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.replace(/^\/+/, '');
    }

    const existing = config.headers?.Authorization;
    if (!existing) {
      const token = getAccessTokenSync() ?? (await getAccessToken());
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const childId = childProfileIdResolver();
    if (childId && !config.headers['X-Child-Profile-Id']) {
      config.headers['X-Child-Profile-Id'] = childId;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _skipAuthLogout?: boolean })
      | undefined;

    const url = originalRequest?.url ?? '';
    const isAuthCredentialCall =
      url.includes('account/login') ||
      url.includes('account/register') ||
      (url.includes('account/me') &&
        String(originalRequest?.method || '').toLowerCase() === 'delete');

    const hadToken =
      !!getAccessTokenSync() ||
      !!(
        originalRequest?.headers?.Authorization ||
        (originalRequest?.headers as { authorization?: string } | undefined)
          ?.authorization
      );

    if (
      status === 401 &&
      !isAuthCredentialCall &&
      !originalRequest?._skipAuthLogout &&
      hadToken
    ) {
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        try {
          await clearAccessToken();
          notifySessionInvalidated();
        } finally {
          setTimeout(() => {
            isHandlingUnauthorized = false;
          }, 500);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
