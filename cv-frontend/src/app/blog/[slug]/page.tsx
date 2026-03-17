import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';
import type { PublicBlogPost } from '@/features/api';
import { marked } from 'marked';
import { getPublicBlogPostBySlug } from '@/lib/public-data';

async function fetchPost(slug: string): Promise<PublicBlogPost | null> {
  return getPublicBlogPostBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: 'Bài viết không tồn tại' };
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.summary ?? undefined;
  const images = post.thumbnail ? [{ url: post.thumbnail, width: 1200, height: 630, alt: post.title }] : [];
  return {
    title,
    description,
    keywords: post.tags?.map((t) => t.name).join(', ') || undefined,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      tags: post.tags?.map((t) => t.name),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
    robots: { index: true, follow: true },
  };
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface Heading { level: number; text: string; id: string }

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) headings.push({ level: m[1].length, text: m[2].trim(), id: slugifyHeading(m[2].trim()) });
  }
  return headings;
}

function renderContent(content: string): string {
  try {
    const renderer = new marked.Renderer();
    const origHeading = renderer.heading.bind(renderer);
    renderer.heading = (token) => {
      const id = slugifyHeading(token.text);
      const base = origHeading(token) as string;
      return base.replace(/^<h(\d)/, `<h$1 id="${id}"`);
    };
    const html = marked.parse(content, { async: false, renderer }) as string;
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?(iframe|object|embed|style|link|meta)[^>]*>/gi, '')
      .replace(/\s+on[a-z]+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript\s*:/gi, '');
  } catch {
    return content;
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) notFound();

  const contentHtml = post.content ? renderContent(post.content) : '';
  const headings = post.content ? extractHeadings(post.content) : [];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>›</span>
          {post.category && (
            <>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-blue-600 transition-colors">
                {post.category.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="line-clamp-1">{post.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        {/* Article header */}
        <article>
          <header className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {post.category && (
                <Link
                  href={`/blog?category=${post.category.slug}`}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {post.category.name}
                </Link>
              )}
              {post.publishedAt && (
                <time className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</time>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight leading-snug mb-6">
              {post.title}
            </h1>
          </header>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8 bg-slate-100">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Content */}
          {contentHtml ? (
            <div
              className="
                text-[15px] leading-relaxed text-foreground
                [&_h1]:text-3xl [&_h1]:font-black [&_h1]:mt-8 [&_h1]:mb-4
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:pb-2
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2
                [&_h4]:text-base [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-1
                [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul>li]:mb-1.5
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol>li]:mb-1.5
                [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-blue-800
                [&_strong]:font-semibold
                [&_em]:italic
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
                [&_code]:bg-slate-100 [&_code]:text-rose-600 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-sm
                [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0
                [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full
                [&_hr]:my-6 [&_hr]:border-border
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-50 [&_th]:font-semibold [&_th]:text-left
                [&_td]:border [&_td]:px-3 [&_td]:py-2
              "
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className="text-muted-foreground italic">Nội dung đang được cập nhật...</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog?tag=${t.slug}`}
                  className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors font-medium"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between">
            <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
              ← Quay lại Blog
            </Link>
            <Link href="/templates" className="text-sm font-semibold text-blue-600 hover:underline">
              Tạo CV ngay →
            </Link>
          </div>
        </article>

        {/* TOC Sidebar */}
        {headings.length > 2 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border bg-slate-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Mục lục</p>
              <nav className="space-y-1">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-xs leading-snug text-slate-600 hover:text-blue-600 transition-colors py-0.5 ${
                      h.level === 3 ? 'pl-3 text-slate-500' : 'font-medium'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
        </div>
      </div>
    </PageTransition>
  );
}
