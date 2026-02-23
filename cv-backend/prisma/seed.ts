import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL for seed');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Đang bắt đầu quá trình Seeding...');

  // --- 1. SEED USERS ---
  const users = [
    {
      id: 'e6a68849-05d5-4ff5-994f-5de6cf0aabcd',
      primary_email: 'nguyenminhtuan800016@gmail.com',
      full_name: 'minhtuan nguyen',
      role: 'admin',
    },
    {
      id: 'b66ff06d-384c-41c8-9845-bdc7b3a5e648',
      primary_email: 'abc@gmail.com',
      full_name: 'Nguyễn Minh Tuấn',
      role: 'admin',
    },
    {
      id: 'e939ffde-9e0c-47cf-81e2-4dc07095f2b9',
      primary_email: 'nguyenminhtuan06012004@gmail.com',
      full_name: 'Nguyễn Minh Tuấn',
      role: 'admin',
    },
  ];

  for (const user of users) {
    await prisma.users.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  console.log('✅ Đã seed Users');

  // --- 2. SEED TEMPLATES ---
  const templates = [
    { id: '7a24c891-6f61-44c7-be80-34c84372e387', name: 'The Scholar Elite' },
    { id: '7c8883a7-d0c9-435a-a8c8-9aa75d1f1165', name: 'The Classic Split' },
    { id: 'b043cc09-d9e3-4579-a08c-c7eaac82b26b', name: 'Electric Gradient' },
    { id: 'c24aa22b-194a-404a-a9d4-9626e58b8f7b', name: 'Modern Minimalist' },
    { id: 'd0535d74-e3cb-453d-b4fb-224ed0084632', name: 'The Tech Terminal' },
    { id: 'ffa13d75-13e4-47c2-a583-5b988f43650a', name: 'Neon Pulse' },
  ];

  for (const t of templates) {
    await prisma.templates.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, is_active: true, credit_cost: 0 },
    });
  }
  console.log('✅ Đã seed Templates');

  // --- 3. SEED BLOG CATEGORIES ---
  const categories = [
    {
      id: '63ef823f-6703-4cc4-883f-aa8dbbb8ee2a',
      name: 'Mẹo Viết CV',
      slug: 'meo-viet-cv',
      description: 'Cung cấp các hướng dẫn chi tiết về nội dung như cách viết kinh nghiệm, học vấn và kỹ năng ấn tượng.',
    },
    {
      id: 'b3402524-23a5-49ac-a37a-6b5af5032e38',
      name: 'Chuẩn ATS',
      slug: 'chuan-ats',
      description: 'Chia sẻ các kỹ thuật tối ưu hóa hồ sơ để dễ dàng vượt qua các hệ thống lọc CV tự động.',
    },
  ];

  for (const cat of categories) {
    await prisma.blog_categories.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // --- 4. SEED BLOG TAGS ---
  const tags = [
    { id: '5a3c5de0-5ffd-4943-958f-ade1a41f05e0', name: 'Mẹo viết CV', slug: 'meo-viet-cv' },
    { id: 'e9fbd55d-1f52-48b4-8d2f-9be7acbd2035', name: 'Lỗi thường gặp', slug: 'loi-thuong-gap' },
    { id: '97741d2c-b0d1-477f-bc45-0992cabf23f7', name: 'Hành trang tìm việc', slug: 'hanh-trang-tim-viec' },
    { id: 'b47da48c-f9da-4ec7-8550-512501615dcc', name: 'Kỹ thuật STAR', slug: 'ky-thuat-star' },
    { id: '5964d55b-3c29-4e3e-8f9c-08215e1dd473', name: 'Kinh nghiệm làm việc', slug: 'kinh-nghiem-lam-viec' },
    { id: '2526f9c8-d4d5-4d63-a2da-71ebce7792e2', name: 'Kỹ năng viết', slug: 'ky-nang-viet' },
    { id: '0ea7b643-c9f0-40e0-b1f8-d7cf1d8eeebb', name: 'Chuẩn ATS', slug: 'chuan-ats' },
    { id: '4de48bda-2c01-4059-a8e4-7a1bc8b81d6d', name: 'Từ khóa CV', slug: 'tu-khoa-cv' },
    { id: 'a83d293a-cb17-45dc-af59-322eccca1439', name: 'Tối ưu hồ sơ', slug: 'toi-uu-ho-so' },
  ];

  for (const tag of tags) {
    await prisma.blog_tags.upsert({
      where: { id: tag.id },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Đã seed Blog Tags');

  // --- 5. SEED BLOG POSTS ---
  const blogPosts = [
    {
      id: '4a4b04ce-5a0f-4af3-922c-149128556cc5',
      category_id: 'b3402524-23a5-49ac-a37a-6b5af5032e38',
      author_id: 'e6a68849-05d5-4ff5-994f-5de6cf0aabcd',
      title: 'ATS là gì và tối ưu CV như thế nào?',
      slug: 'ats-la-gi-va-toi-uu-cv-nhu-the-nao',
      summary:
        'Checklist chi tiết giúp tối ưu từ khóa, cấu trúc và định dạng CV để vượt qua hệ thống lọc ATS.',
      content:
        'ATS (Applicant Tracking System) là hệ thống lọc hồ sơ tự động. Để CV thân thiện ATS, hãy dùng bố cục đơn giản, từ khóa bám theo JD và xuất PDF dạng text.',
      thumbnail: null,
      status: 'published' as const,
      view_count: 0,
      meta_title: 'ATS là gì? Bí quyết tối ưu CV vượt qua bộ lọc tự động',
      meta_description:
        'Giải thích ATS và các cách tối ưu CV theo từ khóa, bố cục và định dạng để tăng cơ hội vào vòng phỏng vấn.',
      published_at: new Date('2026-02-19T05:14:29.043+07:00'),
    },
    {
      id: '0dc83bf0-8bc7-4ca6-8fdc-c4e5004f015b',
      category_id: '63ef823f-6703-4cc4-883f-aa8dbbb8ee2a',
      author_id: 'e6a68849-05d5-4ff5-994f-5de6cf0aabcd',
      title: 'Cách viết kinh nghiệm làm việc "ghi điểm" với phương pháp STAR',
      slug: 'cach-viet-kinh-nghiem-lam-viec-ghi-diem-voi-phuong-phap-star',
      summary:
        'Hướng dẫn áp dụng STAR để biến mô tả công việc thành thành tựu rõ ràng, có số liệu.',
      content:
        'STAR gồm Situation, Task, Action, Result. Khi viết CV, tập trung Action + Result và định lượng bằng số để tăng sức thuyết phục.',
      thumbnail: null,
      status: 'published' as const,
      view_count: 0,
      meta_title: 'Cách viết kinh nghiệm CV bằng STAR',
      meta_description:
        'Công thức STAR giúp bạn trình bày kinh nghiệm làm việc rõ ràng, chuyên nghiệp và nổi bật hơn trong mắt nhà tuyển dụng.',
      published_at: new Date('2026-02-19T05:14:40.193+07:00'),
    },
    {
      id: '4113477b-c8bb-4ab0-9acb-36543b29534b',
      category_id: '63ef823f-6703-4cc4-883f-aa8dbbb8ee2a',
      author_id: 'e6a68849-05d5-4ff5-994f-5de6cf0aabcd',
      title: '5 lỗi CV khiến nhà tuyển dụng bỏ qua',
      slug: '5-loi-cv-khien-nha-tuyen-dung-bo-qua',
      summary:
        'Tổng hợp các lỗi phổ biến khiến CV bị loại và cách sửa nhanh để hồ sơ chuyên nghiệp hơn.',
      content:
        '5 lỗi thường gặp: CV quá dài, không chuẩn ATS, mô tả chung chung, sai chính tả và không tùy biến theo vị trí ứng tuyển.',
      thumbnail: null,
      status: 'published' as const,
      view_count: 0,
      meta_title: '5 lỗi CV thường gặp và cách khắc phục',
      meta_description:
        'Danh sách lỗi hay gặp khi viết CV và hướng dẫn tối ưu để tăng tỉ lệ được gọi phỏng vấn.',
      published_at: new Date('2026-02-19T05:14:48.728+07:00'),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blog_posts.upsert({
      where: { id: post.id },
      update: {
        category_id: post.category_id,
        author_id: post.author_id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        status: post.status,
        view_count: post.view_count,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        published_at: post.published_at,
      },
      create: post,
    });
  }

  const postTagLinks = [
    { post_id: '4a4b04ce-5a0f-4af3-922c-149128556cc5', tag_id: '0ea7b643-c9f0-40e0-b1f8-d7cf1d8eeebb' },
    { post_id: '4a4b04ce-5a0f-4af3-922c-149128556cc5', tag_id: 'a83d293a-cb17-45dc-af59-322eccca1439' },
    { post_id: '4a4b04ce-5a0f-4af3-922c-149128556cc5', tag_id: '4de48bda-2c01-4059-a8e4-7a1bc8b81d6d' },
    { post_id: '0dc83bf0-8bc7-4ca6-8fdc-c4e5004f015b', tag_id: 'b47da48c-f9da-4ec7-8550-512501615dcc' },
    { post_id: '0dc83bf0-8bc7-4ca6-8fdc-c4e5004f015b', tag_id: '5964d55b-3c29-4e3e-8f9c-08215e1dd473' },
    { post_id: '0dc83bf0-8bc7-4ca6-8fdc-c4e5004f015b', tag_id: '5a3c5de0-5ffd-4943-958f-ade1a41f05e0' },
    { post_id: '0dc83bf0-8bc7-4ca6-8fdc-c4e5004f015b', tag_id: '2526f9c8-d4d5-4d63-a2da-71ebce7792e2' },
    { post_id: '4113477b-c8bb-4ab0-9acb-36543b29534b', tag_id: '5a3c5de0-5ffd-4943-958f-ade1a41f05e0' },
    { post_id: '4113477b-c8bb-4ab0-9acb-36543b29534b', tag_id: 'e9fbd55d-1f52-48b4-8d2f-9be7acbd2035' },
    { post_id: '4113477b-c8bb-4ab0-9acb-36543b29534b', tag_id: '97741d2c-b0d1-477f-bc45-0992cabf23f7' },
  ];

  await prisma.blog_post_tags.deleteMany({
    where: {
      post_id: {
        in: blogPosts.map((p) => p.id),
      },
    },
  });

  await prisma.blog_post_tags.createMany({
    data: postTagLinks,
    skipDuplicates: true,
  });

  console.log('✅ Đã seed Blog Posts + Blog Post Tags');

  console.log('🚀 Quá trình Seeding hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });