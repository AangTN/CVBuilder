import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '@/lib/public-data';

export const runtime = 'nodejs';

interface RevalidateBlogPayload {
  secret?: string;
  slugs?: string[];
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { message: 'REVALIDATE_SECRET is not configured' },
      { status: 500 },
    );
  }

  let body: RevalidateBlogPayload = {};
  try {
    body = (await request.json()) as RevalidateBlogPayload;
  } catch {
    body = {};
  }

  const providedSecret =
    request.headers.get('x-revalidate-secret') || body.secret || '';

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const slugs = Array.from(
    new Set(
      (body.slugs || [])
        .map((slug) => normalizeSlug(slug))
        .filter((slug) => slug.length > 0),
    ),
  );

  const invalidatedTags = [
    CACHE_TAGS.blogPosts,
    CACHE_TAGS.blogCategories,
    CACHE_TAGS.blogTags,
    CACHE_TAGS.blogPost,
  ];

  for (const tag of invalidatedTags) {
    revalidateTag(tag, 'max');
  }

  for (const slug of slugs) {
    revalidateTag(CACHE_TAGS.blogPostBySlug(slug), 'max');
    revalidatePath(`/blog/${slug}`);
  }

  revalidatePath('/blog');

  return NextResponse.json({
    revalidated: true,
    invalidatedTags,
    slugs,
  });
}
