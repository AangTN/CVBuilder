import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private startOfDay(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private endOfDay(date: Date) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }

  private startOfWeek(date: Date) {
    const base = this.startOfDay(date);
    const day = base.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    base.setUTCDate(base.getUTCDate() + diff);
    return base;
  }

  private resolveDateRange(period?: string, from?: string, to?: string) {
    const now = new Date();
    const normalizedPeriod = (period || 'month').toLowerCase();

    if (normalizedPeriod === 'custom') {
      const startDateRaw = from
        ? new Date(from)
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const endDateRaw = to ? new Date(to) : now;

      const startDate = Number.isNaN(startDateRaw.getTime())
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        : startDateRaw;
      const endDate = Number.isNaN(endDateRaw.getTime()) ? now : endDateRaw;

      return {
        period: 'custom',
        granularity: 'day' as const,
        from: this.startOfDay(startDate),
        to: this.endOfDay(endDate),
      };
    }

    if (normalizedPeriod === 'day') {
      return {
        period: 'day',
        granularity: 'hour' as const,
        from: this.startOfDay(now),
        to: this.endOfDay(now),
      };
    }

    if (normalizedPeriod === 'week') {
      const startDate = this.startOfWeek(now);
      const endDate = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate() + 6,
          23,
          59,
          59,
          999,
        ),
      );
      return {
        period: 'week',
        granularity: 'day' as const,
        from: startDate,
        to: endDate,
      };
    }

    if (normalizedPeriod === 'year') {
      return {
        period: 'year',
        granularity: 'month' as const,
        from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
        to: new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999)),
      };
    }

    // default: month
    return {
      period: 'month',
      granularity: 'day' as const,
      from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      to: new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      ),
    };
  }

  private buildCalendarBuckets(range: {
    period: string;
    from: Date;
    to: Date;
    granularity: 'hour' | 'day' | 'month';
  }): Array<{ key: string; iso: string }> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const results: Array<{ key: string; iso: string }> = [];

    if (range.granularity === 'hour') {
      const cur = new Date(
        Date.UTC(
          range.from.getUTCFullYear(),
          range.from.getUTCMonth(),
          range.from.getUTCDate(),
          range.from.getUTCHours(),
        ),
      );
      const end = new Date(
        Date.UTC(
          range.to.getUTCFullYear(),
          range.to.getUTCMonth(),
          range.to.getUTCDate(),
          range.to.getUTCHours(),
        ),
      );
      while (cur <= end) {
        const y = cur.getUTCFullYear();
        const mo = pad(cur.getUTCMonth() + 1);
        const d = pad(cur.getUTCDate());
        const h = pad(cur.getUTCHours());
        results.push({ key: `${y}-${mo}-${d} ${h}`, iso: cur.toISOString() });
        cur.setUTCHours(cur.getUTCHours() + 1);
      }
      return results;
    }

    if (range.granularity === 'month') {
      const cur = new Date(
        Date.UTC(range.from.getUTCFullYear(), range.from.getUTCMonth(), 1),
      );
      const end = new Date(
        Date.UTC(range.to.getUTCFullYear(), range.to.getUTCMonth(), 1),
      );
      while (cur <= end) {
        const y = cur.getUTCFullYear();
        const mo = pad(cur.getUTCMonth() + 1);
        results.push({ key: `${y}-${mo}`, iso: cur.toISOString() });
        cur.setUTCMonth(cur.getUTCMonth() + 1);
      }
      return results;
    }

    // day granularity
    const cur = new Date(
      Date.UTC(
        range.from.getUTCFullYear(),
        range.from.getUTCMonth(),
        range.from.getUTCDate(),
      ),
    );
    const end = new Date(
      Date.UTC(
        range.to.getUTCFullYear(),
        range.to.getUTCMonth(),
        range.to.getUTCDate(),
      ),
    );
    while (cur <= end) {
      const y = cur.getUTCFullYear();
      const mo = pad(cur.getUTCMonth() + 1);
      const d = pad(cur.getUTCDate());
      results.push({ key: `${y}-${mo}-${d}`, iso: cur.toISOString() });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return results;
  }

  async getDashboardStats(params: {
    period?: string;
    from?: string;
    to?: string;
  }) {
    const range = this.resolveDateRange(params.period, params.from, params.to);
    const bucketKeys = this.buildCalendarBuckets(range);

    // Use TO_CHAR to produce text bucket keys → no timezone ambiguity
    const fmtSql =
      range.granularity === 'hour'
        ? `TO_CHAR("created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24')`
        : range.granularity === 'month'
          ? `TO_CHAR("created_at" AT TIME ZONE 'UTC', 'YYYY-MM')`
          : `TO_CHAR("created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD')`;

    const createdRows = await this.prisma.$queryRawUnsafe<
      Array<{ bucket: string; count: string }>
    >(
      `
      SELECT ${fmtSql} AS bucket, COUNT(*)::text AS count
      FROM "cvs"
      WHERE "status" = 'active'
        AND "cv_exports" = false
        AND "created_at" >= $1 AND "created_at" <= $2
      GROUP BY bucket ORDER BY bucket ASC
    `,
      range.from,
      range.to,
    );

    const downloadRows = await this.prisma.$queryRawUnsafe<
      Array<{ bucket: string; count: string }>
    >(
      `
      SELECT ${fmtSql} AS bucket, COUNT(*)::text AS count
      FROM "cvs"
      WHERE "status" = 'active'
        AND "cv_exports" = true
        AND "created_at" >= $1 AND "created_at" <= $2
      GROUP BY bucket ORDER BY bucket ASC
    `,
      range.from,
      range.to,
    );

    const createdMap = new Map(
      createdRows.map((r) => [r.bucket, Number(r.count)]),
    );
    const downloadMap = new Map(
      downloadRows.map((r) => [r.bucket, Number(r.count)]),
    );

    const series = bucketKeys.map((b) => ({
      bucket: b.iso,
      createdCount: createdMap.get(b.key) ?? 0,
      downloadCount: downloadMap.get(b.key) ?? 0,
    }));

    const [totalCreatedInRange, totalDownloadInRange] = await Promise.all([
      this.prisma.cvs.count({
        where: {
          status: 'active',
          cv_exports: false,
          created_at: {
            gte: range.from,
            lte: range.to,
          },
        },
      }),
      this.prisma.cvs.count({
        where: {
          status: 'active',
          cv_exports: true,
          created_at: {
            gte: range.from,
            lte: range.to,
          },
        },
      }),
    ]);

    return {
      period: range.period,
      granularity: range.granularity,
      from: range.from,
      to: range.to,
      totals: {
        created: totalCreatedInRange,
        downloads: totalDownloadInRange,
      },
      series,
    };
  }

  async getAccounts() {
    const [summary, accounts] = await Promise.all([
      this.prisma.users.aggregate({
        _count: {
          id: true,
        },
      }),
      this.prisma.users.findMany({
        orderBy: { created_at: 'desc' },
        take: 100,
        select: {
          id: true,
          primary_email: true,
          full_name: true,
          role: true,
          is_active: true,
          created_at: true,
          balance: true,
        },
      }),
    ]);

    const activeCount = accounts.filter((item) => item.is_active).length;
    const adminCount = accounts.filter((item) => item.role === 'admin').length;

    return {
      summary: {
        total: summary._count.id,
        active: activeCount,
        admins: adminCount,
      },
      accounts: accounts.map((item) => ({
        id: item.id,
        email: item.primary_email,
        fullName: item.full_name,
        role: item.role,
        isActive: item.is_active,
        createdAt: item.created_at,
        balance: item.balance,
      })),
    };
  }

  async updateAccount(id: string, dto: { role?: string; isActive?: boolean }) {
    const updated = await this.prisma.users.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isActive !== undefined && { is_active: dto.isActive }),
      },
      select: {
        id: true,
        primary_email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        balance: true,
      },
    });

    return {
      id: updated.id,
      email: updated.primary_email,
      fullName: updated.full_name,
      role: updated.role,
      isActive: updated.is_active,
      createdAt: updated.created_at,
      balance: updated.balance,
    };
  }

  // ─── Blog Categories ────────────────────────────────────────────────────────

  async getBlogCategories() {
    const categories = await this.prisma.blog_categories.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { blog_posts: true } },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      postCount: c._count.blog_posts,
      createdAt: c.created_at,
    }));
  }

  async createBlogCategory(dto: {
    name: string;
    slug: string;
    description?: string;
  }) {
    const category = await this.prisma.blog_categories.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
      },
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at,
    };
  }

  async updateBlogCategory(
    id: string,
    dto: { name?: string; slug?: string; description?: string },
  ) {
    const category = await this.prisma.blog_categories.update({
      where: { id },
      data: dto,
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at,
    };
  }

  async deleteBlogCategory(id: string) {
    await this.prisma.blog_categories.delete({ where: { id } });
    return { success: true };
  }

  // ─── Blog Posts ─────────────────────────────────────────────────────────────

  async getBlogPosts(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, params.pageSize ?? 20);
    const skip = (page - 1) * pageSize;

    const where = params.status
      ? { status: params.status as 'draft' | 'published' }
      : {};

    const [total, posts] = await Promise.all([
      this.prisma.blog_posts.count({ where }),
      this.prisma.blog_posts.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          blog_categories: { select: { id: true, name: true } },
          author: {
            select: { id: true, full_name: true, primary_email: true },
          },
          blog_post_tags: {
            include: {
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
      totalPages: Math.ceil(total / pageSize),
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        thumbnail: p.thumbnail,
        status: p.status,
        viewCount: p.view_count,
        metaTitle: p.meta_title,
        metaDescription: p.meta_description,
        publishedAt: p.published_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        category: p.blog_categories,
        author: p.author
          ? {
              id: p.author.id,
              name: p.author.full_name,
              email: p.author.primary_email,
            }
          : null,
        tags: p.blog_post_tags.map((pt) => pt.blog_tags),
      })),
    };
  }

  async getBlogPostById(id: string) {
    const post = await this.prisma.blog_posts.findUnique({
      where: { id },
      include: {
        blog_categories: { select: { id: true, name: true } },
        author: { select: { id: true, full_name: true, primary_email: true } },
        blog_post_tags: {
          include: {
            blog_tags: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      thumbnail: post.thumbnail,
      status: post.status,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      category: post.blog_categories,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.full_name,
            email: post.author.primary_email,
          }
        : null,
      tags: post.blog_post_tags.map((pt) => pt.blog_tags),
    };
  }

  async createBlogPost(dto: {
    title: string;
    slug: string;
    content: string;
    authorId: string;
    categoryId?: string;
    summary?: string;
    thumbnail?: string;
    status?: 'draft' | 'published';
    metaTitle?: string;
    metaDescription?: string;
    tagIds?: string[];
  }) {
    const post = await this.prisma.blog_posts.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        author_id: dto.authorId,
        category_id: dto.categoryId ?? null,
        summary: dto.summary ?? null,
        thumbnail: dto.thumbnail ?? null,
        status: dto.status ?? 'draft',
        meta_title: dto.metaTitle ?? null,
        meta_description: dto.metaDescription ?? null,
        published_at: dto.status === 'published' ? new Date() : null,
        ...(dto.tagIds?.length && {
          blog_post_tags: {
            create: dto.tagIds.map((tagId) => ({ tag_id: tagId })),
          },
        }),
      },
    });

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      createdAt: post.created_at,
    };
  }

  async updateBlogPost(
    id: string,
    dto: {
      title?: string;
      slug?: string;
      content?: string;
      categoryId?: string | null;
      summary?: string;
      thumbnail?: string;
      status?: 'draft' | 'published';
      metaTitle?: string;
      metaDescription?: string;
      tagIds?: string[];
    },
  ) {
    const data: Prisma.blog_postsUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.categoryId !== undefined)
      data.blog_categories = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'published') data.published_at = new Date();
    }
    if (dto.metaTitle !== undefined) data.meta_title = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      data.meta_description = dto.metaDescription;

    if (dto.tagIds !== undefined) {
      data.blog_post_tags = {
        deleteMany: {},
        create: dto.tagIds.map((tagId) => ({ tag_id: tagId })),
      };
    }

    const post = await this.prisma.blog_posts.update({ where: { id }, data });
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      updatedAt: post.updated_at,
    };
  }

  async deleteBlogPost(id: string) {
    await this.prisma.blog_posts.delete({ where: { id } });
    return { success: true };
  }

  // ─── Blog Tags ───────────────────────────────────────────────────────────

  async getBlogTags() {
    const tags = await this.prisma.blog_tags.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { blog_post_tags: true } } },
    });
    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      postCount: t._count.blog_post_tags,
      createdAt: t.created_at,
    }));
  }

  async createBlogTag(dto: { name: string; slug: string }) {
    const tag = await this.prisma.blog_tags.create({
      data: { name: dto.name, slug: dto.slug },
    });
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: 0,
      createdAt: tag.created_at,
    };
  }

  async updateBlogTag(id: string, dto: { name?: string; slug?: string }) {
    const tag = await this.prisma.blog_tags.update({
      where: { id },
      data: dto,
    });
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.created_at,
    };
  }

  async deleteBlogTag(id: string) {
    await this.prisma.blog_tags.delete({ where: { id } });
    return { success: true };
  }
}
