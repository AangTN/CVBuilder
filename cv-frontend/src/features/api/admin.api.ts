import { ApiClient } from './client';
import {
  AdminAccountsResponse,
  AdminDashboardStatsResponse,
  BlogCategoryItem,
  BlogPostItem,
  BlogPostsResponse,
  BlogTagItem,
} from './types';

export function createAdminApi(client: ApiClient) {
  return {
    getAdminDashboardStats(
      accessToken: string,
      params?: {
        period?: 'day' | 'week' | 'month' | 'year' | 'custom';
        from?: string;
        to?: string;
      },
    ): Promise<AdminDashboardStatsResponse> {
      const query = new URLSearchParams();
      if (params?.period) query.set('period', params.period);
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return client.request<AdminDashboardStatsResponse>(
        qs ? `/admin/dashboard-stats?${qs}` : '/admin/dashboard-stats',
        { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
      );
    },

    getAdminAccounts(accessToken: string): Promise<AdminAccountsResponse> {
      return client.request<AdminAccountsResponse>('/admin/accounts', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    updateAdminAccount(
      accessToken: string,
      id: string,
      body: { role?: string; isActive?: boolean },
    ): Promise<AdminAccountsResponse['accounts'][0]> {
      return client.request(`/admin/accounts/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    },

    // ─── Blog Categories ──────────────────────────────────────────────────────

    getBlogCategories(accessToken: string): Promise<BlogCategoryItem[]> {
      return client.request<BlogCategoryItem[]>('/admin/blog/categories', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    createBlogCategory(
      accessToken: string,
      body: { name: string; slug: string; description?: string },
    ): Promise<BlogCategoryItem> {
      return client.request<BlogCategoryItem>('/admin/blog/categories', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    },

    updateBlogCategory(
      accessToken: string,
      id: string,
      body: { name?: string; slug?: string; description?: string },
    ): Promise<BlogCategoryItem> {
      return client.request<BlogCategoryItem>(`/admin/blog/categories/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    },

    deleteBlogCategory(accessToken: string, id: string): Promise<{ success: boolean }> {
      return client.request(`/admin/blog/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    // ─── Blog Posts ───────────────────────────────────────────────────────────

    getBlogPosts(
      accessToken: string,
      params?: { page?: number; pageSize?: number; status?: string },
    ): Promise<BlogPostsResponse> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('pageSize', String(params.pageSize));
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return client.request<BlogPostsResponse>(
        qs ? `/admin/blog/posts?${qs}` : '/admin/blog/posts',
        { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } },
      );
    },

    getBlogPost(accessToken: string, id: string): Promise<BlogPostItem & { content: string }> {
      return client.request<BlogPostItem & { content: string }>(`/admin/blog/posts/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    createBlogPost(
      accessToken: string,
      body: {
        title: string;
        slug: string;
        content: string;
        categoryId?: string;
        summary?: string;
        thumbnail?: string;
        status?: 'draft' | 'published';
        metaTitle?: string;
        metaDescription?: string;
        tagIds?: string[];
      },
    ): Promise<BlogPostItem> {
      return client.request<BlogPostItem>('/admin/blog/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    },

    updateBlogPost(
      accessToken: string,
      id: string,
      body: Partial<{
        title: string;
        slug: string;
        content: string;
        categoryId: string | null;
        summary: string;
        thumbnail: string;
        status: 'draft' | 'published';
        metaTitle: string;
        metaDescription: string;
        tagIds: string[];
      }>,
    ): Promise<BlogPostItem> {
      return client.request<BlogPostItem>(`/admin/blog/posts/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    },

    deleteBlogPost(accessToken: string, id: string): Promise<{ success: boolean }> {
      return client.request(`/admin/blog/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    // ─── Blog Tags ──────────────────────────────────────────────────────────

    getBlogTags(accessToken: string): Promise<BlogTagItem[]> {
      return client.request<BlogTagItem[]>('/admin/blog/tags', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },

    createBlogTag(
      accessToken: string,
      body: { name: string; slug: string },
    ): Promise<BlogTagItem> {
      return client.request<BlogTagItem>('/admin/blog/tags', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },

    updateBlogTag(
      accessToken: string,
      id: string,
      body: { name?: string; slug?: string },
    ): Promise<BlogTagItem> {
      return client.request<BlogTagItem>(`/admin/blog/tags/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },

    deleteBlogTag(accessToken: string, id: string): Promise<{ success: boolean }> {
      return client.request(`/admin/blog/tags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
  };
}
