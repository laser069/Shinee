import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types';
import userService from '../services/userService';
import { setAuthToken } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Auth from LocalStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setAuthToken(storedToken); // Sync the Axios instance
        } catch (e) {
          logout(); // Clear if data is malformed
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // 2. Login Logic
  const login = async (credentials: LoginPayload): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      // Destructure the clean data from our service
      const { user: userData, token: authToken } = await userService.login(credentials);

      // Persist to LocalStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update State
      setToken(authToken);
      setUser(userData);
      setAuthToken(authToken);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Register Logic
  const register = async (userData: RegisterPayload): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const { user: newUser, token: authToken } = await userService.register(userData);

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(authToken);
      setUser(newUser);
      setAuthToken(authToken);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setError(null);
  };

  // Computed properties
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};