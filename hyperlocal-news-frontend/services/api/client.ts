import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { getAuthToken } from './token';
import { ApiError, ApiResponse } from '@/types';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl || undefined,
  timeout: API_CONFIG.timeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeAxiosError = (error: AxiosError<ApiResponse<unknown>>): ApiError => {
  const response = error.response?.data;

  if (response?.error) {
    return response.error;
  }

  return {
    code: error.code ?? 'NETWORK_ERROR',
    message: response?.message || error.message || 'Request failed',
  };
};

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
};

export const request = async <T>(config: AxiosRequestConfig) => {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
};
