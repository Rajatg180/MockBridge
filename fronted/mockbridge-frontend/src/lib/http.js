import axios from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;
let config = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onTokensUpdated: () => {},
  onUnauthorized: () => {},
};

export function setupHttpInterceptors(nextConfig) {
  config = { ...config, ...nextConfig };
}

api.interceptors.request.use((request) => {
  const token = config.getAccessToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');
    const isLoginCall = originalRequest?.url?.includes('/auth/login');
    const isRegisterCall = originalRequest?.url?.includes('/auth/register');

    if (status !== 401 || originalRequest?._retry || isRefreshCall || isLoginCall || isRegisterCall) {
      return Promise.reject(error);
    }

    const refreshToken = config.getRefreshToken();
    if (!refreshToken) {
      config.onUnauthorized();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/refresh', { refreshToken })
          .then((response) => {
            const tokens = {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken || refreshToken,
            };
            config.onTokensUpdated(tokens);
            return tokens;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const tokens = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      config.onUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);
