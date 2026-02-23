import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role?: string;
}

export interface AuthCookies {
  refreshToken?: string;
  [key: string]: unknown;
}

export type AuthRequest = Request & {
  user: AuthenticatedUser;
  cookies: AuthCookies;
};
