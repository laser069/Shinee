import apiClient from '../lib/apiClient';
import type { 
  User, 
  LoginResponse, 
  RegisterResponse, 
  RegisterPayload, 
  LoginPayload, 
  ApiResponse 
} from '../types';

/**
 * Service for User and Authentication operations
 */
const userService = {
  /**
   * Register a new user
   */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<ApiResponse<RegisterResponse>>('/users/register', payload);
    return data.data;
  },

  /**
   * Login user and return tokens
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/users/login', payload);
    return data.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>('/users/profile');
    return data.data;
  },

  /**
   * Access admin-only data
   */
  getAdminPanel: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.get<ApiResponse<{ message: string }>>('/users/admin-panel');
    return data.data;
  },

  /**
   * Logout user
   * Clears local storage and provides a clean state
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Optional: window.location.href = '/login';
  },
};

export default userService;