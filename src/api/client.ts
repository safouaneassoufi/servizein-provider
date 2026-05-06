import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '@/constants/api';
import { storage } from '@/utils/storage';
import { useAuthStore } from '@/store/auth.store';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject access token ────────────────────────────────

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — unwrap { success, data, timestamp } + handle 401 ──

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: AxiosError | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(apiClient(config));
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps all responses: { success, data, timestamp } → return inner data
    const payload = response.data;
    return payload?.data !== undefined ? payload.data : payload;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    console.error(
      '[API]',
      originalRequest?.method?.toUpperCase(),
      originalRequest?.url,
      '→',
      error.response?.status,
      (error.response?.data as any)?.message ?? error.message,
    );

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data: raw } = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
        { refreshToken },
      );

      // Backend wraps refresh response too: { success, data: { accessToken, refreshToken } }
      const tokens = raw?.data ?? raw;
      const { accessToken, refreshToken: newRefresh } = tokens;

      await storage.setTokens(accessToken, newRefresh);
      useAuthStore.getState().setTokens({ accessToken, refreshToken: newRefresh });

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      await useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
