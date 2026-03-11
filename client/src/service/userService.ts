import apiClient, { type User, type LoginResponse, type RegisterResponse } from '../lib/apiClient';

// Types for request payloads
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// API endpoints
const USER_ENDPOINTS = {
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  PROFILE: '/users/profile',
  ADMIN_PANEL: '/users/admin-panel',
} as const;

/**
 * Register a new user
 * POST /api/users/register
 */
export const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(USER_ENDPOINTS.REGISTER, payload);
  return response.data;
};

/**
 * Login user
 * POST /api/users/login
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(USER_ENDPOINTS.LOGIN, payload);
  return response.data;
};

/**
 * Get user profile
 * GET /api/users/profile
 * Requires JWT token
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>(USER_ENDPOINTS.PROFILE);
  return response.data;
};

/**
 * Get admin panel data
 * GET /api/users/admin-panel
 * Requires JWT token and admin role
 */
export const getAdminPanel = async (): Promise<{ message: string }> => {
  const response = await apiClient.get<{ message: string }>(USER_ENDPOINTS.ADMIN_PANEL);
  return response.data;
};

/**
 * Logout user (client-side only)
 * Clears tokens from localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Default export
const userService = {
  register,
  login,
  getProfile,
  getAdminPanel,
  logout,
};

export default userService;
