import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';

export const metadata: Metadata = {
  title: 'Câu Hỏi Thường Gặp (FAQ) - CV Builder',
  description: 'Giải đáp thắc mắc phổ biến về cách tạo CV, tải PDF, chỉnh sửa mẫu CV và bảo mật thông tin người dùng.',
  openGraph: {
    title: 'Câu Hỏi Thường Gặp (FAQ) - CV Builder',
    description: 'Giải đáp thắc mắc về tạo CV và sử dụng CV Builder.',
    type: 'website',
  },
  alternates: {
    canonical: '/faq',
  },
};

const faqs = [
  {
    q: 'Tôi có thể tạo CV miễn phí không?',
    a: 'Có. Bạn có thể tạo và chỉnh sửa CV miễn phí với các mẫu cơ bản.',
  },
  {
    q: 'CV xuất ra định dạng gì?',
    a: 'Hiện hỗ trợ tải PDF để nộp hồ sơ nhanh và đảm bảo định dạng ổn định.',
  },
  {
    q: 'Tôi có thể chỉnh sửa CV đã lưu không?',
    a: 'Có. Bạn vào mục “CV Của Tôi”, chọn CV muốn chỉnh và cập nhật trực tiếp.',
  },
  {
    q: 'Dữ liệu của tôi có được bảo mật không?',
    a: 'Có. Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ dữ liệu người dùng.',
  },
];

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">
            Câu Hỏi Thường Gặp
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Giải đáp nhanh các thắc mắc phổ biến về CV Builder.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((item) => (
            <article key={item.q} className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 group">
              <h2 className="font-bold text-foreground text-lg mb-3 flex gap-3 items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mt-1">?</span>
                {item.q}
              </h2>
              <p className="pl-9 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {item.a}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center rounded-2xl bg-slate-50 p-8 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <p className="font-medium text-foreground mb-4">Bạn vẫn còn câu hỏi khác?</p>
          <a 
            href="mailto:support@cvbuilder.com" 
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </PageTransition>
  );
}
