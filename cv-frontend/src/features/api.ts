import { createAdminApi } from './api/admin.api';
import { createAuthApi } from './api/auth.api';
import { ApiClient } from './api/client';
import { createCvsApi } from './api/cvs.api';
import { createTemplatesApi } from './api/templates.api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type {
  AdminAccountsResponse,
  AdminDashboardStatsResponse,
  ApiError,
  AuthResponse,
  BlogCategoryItem,
  BlogPostItem,
  BlogPostsResponse,
  BlogTagItem,
  CvApiResponse,
  CvPayload,
  ExportHistoryItem,
  ExportHistoryResponse,
  GoogleLoginRequest,
  LoginRequest,
  PublicBlogCategory,
  PublicBlogPost,
  PublicBlogPostSummary,
  PublicBlogPostsResponse,
  PublicBlogTagItem,
  RegisterRequest,
  TemplateApiResponse,
} from './api/types';

const client = new ApiClient(API_BASE_URL);

export const api = {
  ...createAuthApi(client),
  ...createCvsApi(client),
  ...createTemplatesApi(client),
  ...createAdminApi(client),
};
