import 'server-only';

import type {
  PublicBlogCategory,
  PublicBlogPost,
  PublicBlogPostsResponse,
  PublicBlogTagItem,
  TemplateApiResponse,
} from '@/features/api/types';

const API_SERVER_BASE =
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

function toApiUrl(path: string) {
  return `${API_SERVER_BASE}${path}`;
}

export const CACHE_TAGS = {
  templatesList: 'templates:list',
  blogPosts: 'blog:posts',
  blogCategories: 'blog:categories',
  blogTags: 'blog:tags',
  blogPost: 'blog:post',
  blogPostBySlug: (slug: string) => `blog:post:${slug}`,
} as const;

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export async function getPublicTemplates(): Promise<TemplateApiResponse[]> {
  try {
    const response = await fetch(toApiUrl('/templates'), {
      next: {
        revalidate: 1800,
        tags: [CACHE_TAGS.templatesList],
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function getPublicBlogPosts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  q?: string;
}): Promise<PublicBlogPostsResponse | null> {
  const query = new URLSearchParams();

  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.pageSize && params.pageSize > 0) {
    query.set('pageSize', String(params.pageSize));
  }
  if (params.category) query.set('category', params.category);
  if (params.tag) query.set('tag', params.tag);
  if (params.q) query.set('q', params.q);

  const url = query.toString()
    ? toApiUrl(`/blog/posts?${query}`)
    : toApiUrl('/blog/posts');

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 60,
        tags: [CACHE_TAGS.blogPosts],
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function getPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  try {
    const response = await fetch(toApiUrl('/blog/categories'), {
      next: {
        revalidate: 300,
        tags: [CACHE_TAGS.blogCategories],
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function getPublicBlogTags(): Promise<PublicBlogTagItem[]> {
  try {
    const response = await fetch(toApiUrl('/blog/tags'), {
      next: {
        revalidate: 300,
        tags: [CACHE_TAGS.blogTags],
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function getPublicBlogPostBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  const normalizedSlug = normalizeSlug(slug);

  try {
    const response = await fetch(
      toApiUrl(`/blog/posts/${encodeURIComponent(normalizedSlug)}`),
      {
        next: {
          revalidate: 60,
          tags: [
            CACHE_TAGS.blogPost,
            CACHE_TAGS.blogPostBySlug(normalizedSlug),
          ],
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch blog post');
    }

    return response.json();
  } catch {
    return null;
  }
}
