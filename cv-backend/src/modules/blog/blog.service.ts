import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getPosts(params: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    q?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(24, params.pageSize ?? 9);
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { status: 'published' };

    if (params.categorySlug) {
      where.blog_categories = { slug: params.categorySlug };
    }

    if (params.tagSlug) {
      where.blog_post_tags = {
        some: { blog_tags: { slug: params.tagSlug } },
      };
    }

    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, posts] = await Promise.all([
      this.prisma.blog_posts.count({ where }),
      this.prisma.blog_posts.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { published_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          thumbnail: true,
          view_count: true,
          published_at: true,
          blog_categories: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, full_name: true, avatar_url: true } },
          blog_post_tags: {
            select: {
              blog_tags: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        thumbnail: p.thumbnail,
        viewCount: p.view_count,
        publishedAt: p.published_at,
        category: p.blog_categories,
        author: p.author
          ? {
              id: p.author.id,
              name: p.author.full_name,
              avatarUrl: p.author.avatar_url,
            }
          : null,
        tags: p.blog_post_tags.map((pt) => pt.blog_tags),
      })),
    };
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.blog_posts.findUnique({
      where: { slug, status: 'published' },
      include: {
        blog_categories: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, full_name: true, avatar_url: true } },
        blog_post_tags: {
          select: {
            blog_tags: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại hoặc chưa được đăng');
    }

    // Increment view count (fire-and-forget)
    void this.prisma.blog_posts.update({
      where: { id: post.id },
      data: { view_count: { increment: 1 } },
    });

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      thumbnail: post.thumbnail,
      viewCount: post.view_count,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      category: post.blog_categories,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.full_name,
            avatarUrl: post.author.avatar_url,
          }
        : null,
      tags: post.blog_post_tags.map((pt) => pt.blog_tags),
    };
  }

  async getCategories() {
    const cats = await this.prisma.blog_categories.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { blog_posts: { where: { status: 'published' } } },
        },
      },
    });

    return cats
      .filter((c) => c._count.blog_posts > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        postCount: c._count.blog_posts,
      }));
  }

  async getTags() {
    const tags = await this.prisma.blog_tags.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            blog_post_tags: {
              where: { blog_posts: { status: 'published' } },
            },
          },
        },
      },
    });

    return tags
      .filter((t) => t._count.blog_post_tags > 0)
      .map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        postCount: t._count.blog_post_tags,
      }));
  }
}
