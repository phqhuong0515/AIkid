import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

export type StorymeeClientOptions = {
  /** Gateway base, e.g. https://dev-hub.storymee.com */
  baseURL: string;
  timeoutMs?: number;
  /** Sync token preferred in interceptor */
  getAccessTokenSync?: () => string | null;
  getAccessToken?: () => Promise<string | null>;
  clearAccessToken?: () => void | Promise<void>;
  onUnauthorized?: () => void;
  /** Active child profile for X-Child-Profile-Id */
  getChildProfileId?: () => string | null;
  /** Paths that should not trigger logout on 401 */
  isCredentialAuthUrl?: (url: string, method?: string) => boolean;
};

function defaultIsCredentialAuthUrl(url: string, method?: string): boolean {
  const m = (method || 'get').toLowerCase();
  if (
    url.includes('account/login') ||
    url.includes('account/register') ||
    url.includes('account/auth/firebase/') ||
    url.includes('family/child-login') ||
    url.includes('device-pair')
  ) {
    return true;
  }
  if (url.includes('account/me') && m === 'delete') return true;
  return false;
}

/**
 * Gateway-only Axios client shared by all product apps.
 * Inject token storage from the host app (SecureStore / localStorage).
 */
export function createStorymeeClient(
  opts: StorymeeClientOptions,
): AxiosInstance {
  const client = axios.create({
    baseURL: opts.baseURL.replace(/\/$/, ''),
    timeout: opts.timeoutMs ?? 30_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let isHandlingUnauthorized = false;
  const isCred = opts.isCredentialAuthUrl || defaultIsCredentialAuthUrl;

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (config.url && config.url.startsWith('/')) {
        config.url = config.url.replace(/^\/+/, '');
      }

      const existing = config.headers?.Authorization;
      if (!existing) {
        const sync = opts.getAccessTokenSync?.() ?? null;
        const token = sync ?? (opts.getAccessToken ? await opts.getAccessToken() : null);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      const childId = opts.getChildProfileId?.() ?? null;
      if (childId && !config.headers['X-Child-Profile-Id']) {
        config.headers['X-Child-Profile-Id'] = childId;
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _skipAuthLogout?: boolean })
        | undefined;
      const url = originalRequest?.url ?? '';
      const method = originalRequest?.method;

      const hadToken =
        !!(opts.getAccessTokenSync?.() ?? null) ||
        !!(
          originalRequest?.headers?.Authorization ||
          (originalRequest?.headers as { authorization?: string } | undefined)
            ?.authorization
        );

      if (
        status === 401 &&
        !isCred(url, method) &&
        !originalRequest?._skipAuthLogout &&
        hadToken
      ) {
        if (!isHandlingUnauthorized) {
          isHandlingUnauthorized = true;
          try {
            await opts.clearAccessToken?.();
            opts.onUnauthorized?.();
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

  return client;
}

export type StorymeeHttp = AxiosInstance;
