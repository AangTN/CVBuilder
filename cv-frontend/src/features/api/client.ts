import { ApiError } from './types';

export class ApiClient {
  private readonly baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private readonly publicAuthEndpoints = new Set([
    '/auth/login',
    '/auth/register',
    '/auth/google',
    '/auth/refresh',
  ]);

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  getBaseUrl() {
    return this.baseURL;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async handleTokenRefresh(): Promise<string> {
    try {
      const response = await this.request<{ accessToken: string }>(
        '/auth/refresh',
        {
          method: 'POST',
        },
      );
      return response.accessToken;
    } catch {
      this.forceLogout();
      throw { message: 'Session expired. Please login again.', statusCode: 401 } as ApiError;
    }
  }

  private forceLogout() {
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const raw = await response.text();
      let data: unknown = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }

      if (!response.ok) {
        if (
          response.status === 401 &&
          !isRetry &&
          !this.publicAuthEndpoints.has(endpoint)
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.subscribeTokenRefresh((newToken: string) => {
                const newOptions = {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                };
                this.request<T>(endpoint, newOptions, true)
                  .then(resolve)
                  .catch(reject);
              });
            });
          }

          this.isRefreshing = true;

          try {
            const newAccessToken = await this.handleTokenRefresh();
            this.isRefreshing = false;
            this.onTokenRefreshed(newAccessToken);

            const newOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            };
            return this.request<T>(endpoint, newOptions, true);
          } catch (refreshError) {
            this.isRefreshing = false;
            throw refreshError;
          }
        }

        throw {
          message:
            typeof data === 'object' &&
            data !== null &&
            'message' in data &&
            typeof (data as { message?: unknown }).message === 'string'
              ? ((data as { message: string }).message || 'Something went wrong')
              : 'Something went wrong',
          statusCode: response.status,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if ((error as ApiError).message) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      } as ApiError;
    }
  }
}
