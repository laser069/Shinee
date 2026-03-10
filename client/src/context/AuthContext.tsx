import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginResponse } from '../lib/apiClient';
import userService from '../service/userService';
import type { RegisterPayload, LoginPayload } from '../service/userService';
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth data on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setAuthToken(storedToken);
        
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Failed to parse stored user:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginPayload): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const response: LoginResponse = await userService.login(credentials);

      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response._id,
        name: response.name,
        email: response.email,
        isAdmin: response.isAdmin,
      }));

      // Update state
      setToken(response.token);
      setAuthToken(response.token);
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        isAdmin: response.isAdmin,
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterPayload): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await userService.register(userData);

      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update state
      setToken(response.token);
      setAuthToken(response.token);
      setUser(response.user);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Reset state
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  // Computed values
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.isAdmin ?? false;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
