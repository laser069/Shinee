import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Base URL for the API - points to backend server through proxy
const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - adds JWT token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor - handles global errors
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // If we haven't tried to refresh the token yet
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);

            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // If token refresh failed or was already attempted, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Helper function to set auth token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common.Authorization;
  }
};

// Helper function to clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common.Authorization;
};

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Task status enum
export type TaskStatus = 'todo' | 'inprogress' | 'done';

// Task interface
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Board interface
export interface Board {
  _id: string;
  title: string;
  user: string;
  tasks: string[]; // Array of task IDs, not full Task objects
  createdAt?: string;
  updatedAt?: string;
}

export default apiClient;
