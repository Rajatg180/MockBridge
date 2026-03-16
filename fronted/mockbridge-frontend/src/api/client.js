import axios from 'axios';

import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from '../utils/storage';
import { normalizeApiError } from '../utils/http';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onRefreshSuccess = () => {};
let onAuthFailure = () => {};
let refreshPromise = null;

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export function registerAuthCallbacks(callbacks = {}) {
  onRefreshSuccess = callbacks.onRefreshSuccess || (() => {});
  onAuthFailure = callbacks.onAuthFailure || (() => {});
}

function isPublicAuthRequest(url = '') {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

publicClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = loadStoredSession();

    if (accessToken && !config.skipAuth) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error)),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeApiError(error);
    const originalRequest = error.config || {};

    if (
      normalized.status !== 401 ||
      originalRequest._retry ||
      originalRequest.skipAuth ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(normalized);
    }

    const { refreshToken } = loadStoredSession();

    if (!refreshToken) {
      clearStoredSession();
      onAuthFailure(normalized);
      return Promise.reject(normalized);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = publicClient
          .post(
            '/auth/refresh',
            { refreshToken },
            {
              skipAuth: true,
            },
          )
          .then((response) => {
            const nextSession = {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken || refreshToken,
            };

            saveStoredSession(nextSession);
            onRefreshSuccess(nextSession);

            return nextSession;
          })
          .catch((refreshError) => {
            const parsedError = normalizeApiError(refreshError);
            clearStoredSession();
            onAuthFailure(parsedError);
            throw parsedError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const nextSession = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
