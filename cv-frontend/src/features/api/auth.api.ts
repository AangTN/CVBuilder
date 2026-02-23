import { ApiClient } from './client';
import {
  AuthResponse,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from './types';

export function createAuthApi(client: ApiClient) {
  return {
    register(data: RegisterRequest): Promise<AuthResponse> {
      return client.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login(data: LoginRequest): Promise<AuthResponse> {
      return client.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
      return client.request<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    logout(accessToken: string): Promise<{ message: string }> {
      return client.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },

    refreshToken(): Promise<{ accessToken: string }> {
      return client.request<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
      });
    },

    getProfile(
      accessToken: string,
    ): Promise<{ user: AuthResponse['user'] }> {
      return client.request<{ user: AuthResponse['user'] }>('/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
  };
}
