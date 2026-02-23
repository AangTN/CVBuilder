import { ApiClient } from './client';
import {
  PublicBlogPost,
  PublicBlogPostsResponse,
  PublicBlogCategory,
  PublicBlogTagItem,
} from './types';

export function createBlogApi(client: ApiClient) {
  return {
    getBlogPosts(params?: {
      page?: number;
      pageSize?: number;
      category?: string;
      tag?: string;
      q?: string;
    }): Promise<PublicBlogPostsResponse> {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('pageSize', String(params.pageSize));
      if (params?.category) query.set('category', params.category);
      if (params?.tag) query.set('tag', params.tag);
      if (params?.q) query.set('q', params.q);
      const qs = query.toString();
      return client.request<PublicBlogPostsResponse>(
        qs ? `/blog/posts?${qs}` : '/blog/posts',
        { method: 'GET' },
      );
    },

    getBlogPostBySlug(slug: string): Promise<PublicBlogPost> {
      return client.request<PublicBlogPost>(`/blog/posts/${slug}`, {
        method: 'GET',
      });
    },

    getBlogCategories(): Promise<PublicBlogCategory[]> {
      return client.request<PublicBlogCategory[]>('/blog/categories', {
        method: 'GET',
      });
    },

    getBlogTagsPublic(): Promise<PublicBlogTagItem[]> {
      return client.request<PublicBlogTagItem[]>('/blog/tags', {
        method: 'GET',
      });
    },
  };
}
