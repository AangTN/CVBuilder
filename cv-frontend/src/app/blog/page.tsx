import Link from 'next/link';
import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';
import type { PublicBlogPostSummary, PublicBlogCategory } from '@/features/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchPosts(params: {
  page?: number;
  category?: string;
  tag?: string;
}) {
  const query = new URLSearchParams();
  query.set('pageSize', '9');
  if (params.page && params.page > 1) query.set('page', String(params.page));
  if (params.category) query.set('category', params.category);
  if (params.tag) query.set('tag', params.tag);
  try {
    const res = await fetch(`${API_BASE}/blog/posts?${query}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json() as Promise<{ total: number; page: number; totalPages: number; posts: PublicBlogPostSummary[] }>;
  } catch { return null; }
}

async function fetchCategories(): Promise<PublicBlogCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/blog/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export const metadata: Metadata = {
  title: 'Blog CV - Mẹo Viết CV & Kinh Nghiệm Phỏng Vấn',
  description: 'Tổng hợp mẹo viết CV chuyên nghiệp, cách tối ưu từ khóa ATS và bí quyết trả lời phỏng vấn giúp bạn chinh phục nhà tuyển dụng.',
  openGraph: {
    title: 'Blog CV - Mẹo Viết CV & Kinh Nghiệm Phỏng Vấn',
    description: 'Tổng hợp mẹo viết CV chuyên nghiệp, cách tối ưu từ khóa ATS và bí quyết trả lời phỏng vấn.',
    type: 'website',
  },
  alternates: { canonical: '/blog' },
};

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const category = params.category || '';
  const tag = params.tag || '';

  const [data, categories] = await Promise.all([
    fetchPosts({ page, category, tag }),
    fetchCategories(),
  ]);

  const posts = data?.posts ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const buildUrl = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const next = { page, category, tag, ...overrides };
    if (Number(next.page) > 1) p.set('page', String(next.page));
    if (next.category) p.set('category', String(next.category));
    if (next.tag) p.set('tag', String(next.tag));
    const qs = p.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Blog</h1>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <Link href={buildUrl({ category: '', page: 1 })} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
              Tất cả
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={buildUrl({ category: c.slug, page: 1 })} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === c.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}>
                {c.name} <span className="opacity-60">({c.postCount})</span>
              </Link>
            ))}
          </div>
        )}

        {/* Active tag filter */}
        {tag && (
          <div className="flex gap-2 mb-4 items-center text-sm">
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
              Tag: #{tag}
              <Link href={buildUrl({ tag: '', page: 1 })} className="ml-1 hover:text-purple-900">✕</Link>
            </span>
          </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Không có bài viết nào.</p>
            {(category || tag) && (
              <Link href="/blog" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Xem tất cả bài viết →</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group relative flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900">
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {post.category && (
                        <Link href={buildUrl({ category: post.category.slug, page: 1 })} className="relative z-10 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                          {post.category.name}
                        </Link>
                      )}
                      {post.publishedAt && (
                        <time className="text-[11px] text-muted-foreground">{formatDate(post.publishedAt)}</time>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {post.title}
                      </Link>
                    </h2>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.summary}</p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((t) => (
                          <Link key={t.id} href={buildUrl({ tag: t.slug, page: 1 })} className="relative z-10 text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded hover:bg-purple-100 transition-colors">
                            #{t.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={buildUrl({ page: page - 1 })} className="px-4 py-2 rounded-lg border text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-all">← Trước</Link>
                )}
                <span className="text-sm text-muted-foreground px-3">Trang {page} / {totalPages}</span>
                {page < totalPages && (
                  <Link href={buildUrl({ page: page + 1 })} className="px-4 py-2 rounded-lg border text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-all">Tiếp →</Link>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-10">
          <Link href="/templates" className="text-sm font-semibold text-blue-600 hover:underline">Bắt đầu tạo CV ngay →</Link>
        </div>
      </div>
    </PageTransition>
  );
}
