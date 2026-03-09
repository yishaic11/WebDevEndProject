import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config/env';

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);

  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;

let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError | Error) => void;
}> = [];

const processPending = (error: AxiosError | Error | null, token: string | null = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const status = error.response?.status;
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

    if (!originalRequest || (status !== 401 && status !== 403) || originalRequest._retry || !refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<TokenResponse>(
        `${API_URL}/auth/refreshToken`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );

      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }

      processPending(null, data.accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.user);

      const finalError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));

      processPending(finalError);

      window.location.href = '/login';

      return Promise.reject(finalError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
