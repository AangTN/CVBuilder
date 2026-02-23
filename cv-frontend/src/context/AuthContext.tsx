'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/features/api';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  balance: number;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  ensureAccessToken: () => Promise<string>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-refresh accessToken on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        
        // Nếu có user, thử lấy accessToken mới từ cookie
        if (storedUser) {
          try {
            const response = await api.refreshToken();
            setAccessToken(response.accessToken);
            setUser(JSON.parse(storedUser));
          } catch {
            // RefreshToken không hợp lệ → logout
            localStorage.removeItem(USER_KEY);
            setAccessToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      
      if (response.tokens) {
        // Chỉ lưu user vào localStorage
        // accessToken lưu trong state, refreshToken lưu trong cookie (tự động)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        
        setAccessToken(response.tokens.accessToken);
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.googleLogin({ credential });

      if (response.tokens) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setAccessToken(response.tokens.accessToken);
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      await api.register({ email, password, fullName });
      
      // After registration, user needs to login
      // Backend doesn't return tokens on registration
      // Just return successfully - user will be prompted to login
      return;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Gửi accessToken để backend verify
      // RefreshToken tự động gửi qua cookie
      if (accessToken) {
        await api.logout(accessToken);
      } else {
        // Nếu không có accessToken, thử refresh trước
        try {
          const response = await api.refreshToken();
          await api.logout(response.accessToken);
        } catch (error) {
          console.error('Failed to refresh token before logout:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem(USER_KEY);
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await api.refreshToken();
      const newAccessToken = response.accessToken;

      // Chỉ set vào state, không lưu localStorage
      setAccessToken(newAccessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  // Ensure we have a valid access token before making API calls
  const ensureAccessToken = async (): Promise<string> => {
    // Nếu đã có accessToken, trả về luôn
    if (accessToken) {
      return accessToken;
    }

    // Nếu chưa có, thử refresh từ cookie
    try {
      const response = await api.refreshToken();
      const newAccessToken = response.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshAccessToken,
        ensureAccessToken,
        isAuthenticated: !!user && !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
