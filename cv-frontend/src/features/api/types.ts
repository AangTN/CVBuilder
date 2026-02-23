export type CvPayload = {
  template_id: string;
  language?: string;
  settings?: Record<string, unknown>;
  sections: Array<{
    section_type: string;
    title: string;
    is_visible?: boolean;
    items: Array<{
      content: Record<string, unknown>;
      position?: number;
    }>;
  }>;
  name?: string;
};

export type CvApiResponse = {
  id: string;
  name?: string;
  template_id?: string;
  language?: string;
  settings?: Record<string, unknown>;
  cv_sections?: Array<{
    id: string;
    section_type: string;
    title: string;
    is_visible?: boolean;
    cv_section_items?: Array<{
      id: string;
      content: Record<string, unknown>;
      position?: number;
    }>;
  }>;
  templates?: {
    id: string;
    name?: string;
  };
  created_at?: string;
  updated_at?: string;
};

export type TemplateApiResponse = {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  credit_cost?: number | null;
  is_premium?: boolean | null;
  is_active?: boolean | null;
};

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl?: string | null;
    balance: number;
    role?: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface ExportHistoryItem {
  id: string;
  name?: string | null;
  template_id?: string;
  created_at?: string;
  updated_at?: string;
  templates?: {
    id: string;
    name: string;
  };
}

export interface ExportHistoryResponse {
  items: ExportHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminDashboardStatsResponse {
  period: 'day' | 'week' | 'month' | 'year' | 'custom' | string;
  granularity: 'hour' | 'day' | 'month' | string;
  from: string;
  to: string;
  totals: {
    created: number;
    downloads: number;
  };
  series: Array<{
    bucket: string;
    createdCount: number;
    downloadCount: number;
  }>;
}

export interface AdminAccountsResponse {
  summary: {
    total: number;
    active: number;
    admins: number;
  };
  accounts: Array<{
    id: string;
    email: string;
    fullName?: string | null;
    role?: string | null;
    isActive?: boolean | null;
    createdAt?: string | null;
    balance?: number | null;
  }>;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  postCount: number;
  createdAt?: string | null;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnail?: string | null;
  status: 'draft' | 'published';
  viewCount: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  category?: { id: string; name: string } | null;
  author?: { id: string; name?: string | null; email: string } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export interface BlogPostsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  posts: BlogPostItem[];
}

export interface BlogTagItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt?: string | null;
}

// ─── Public Blog (no auth) ───────────────────────────────────────────────────

export interface PublicBlogPostAuthor {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface PublicBlogPostSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  thumbnail: string | null;
  viewCount: number;
  publishedAt: string | null;
  category: { id: string; name: string; slug: string } | null;
  author: PublicBlogPostAuthor | null;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export interface PublicBlogPost extends PublicBlogPostSummary {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string | null;
}

export interface PublicBlogPostsResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  posts: PublicBlogPostSummary[];
}

export interface PublicBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface PublicBlogTagItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}
