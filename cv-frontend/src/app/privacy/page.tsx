import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật - CV Builder',
  description: 'Cam kết bảo vệ thông tin người dùng. Tìm hiểu về cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu CV của bạn.',
  openGraph: {
    title: 'Chính Sách Bảo Mật - CV Builder',
    description: 'Cam kết bảo vệ thông tin người dùng và dữ liệu CV.',
    type: 'website',
  },
  alternates: {
    canonical: '/privacy',
  },
};

const sections = [
  {
    title: '1. Dữ liệu thu thập',
    content: 'Chúng tôi thu thập thông tin tài khoản (email, tên) và dữ liệu CV bạn chủ động cung cấp để phục vụ chức năng tạo/chỉnh sửa CV. Chúng tôi không tự động thu thập thêm bất kỳ thông tin nào khác.',
  },
  {
    title: '2. Mục đích sử dụng',
    content: 'Dữ liệu được dùng để cung cấp dịch vụ, cải thiện trải nghiệm người dùng và hỗ trợ xuất CV PDF. Chúng tôi không sử dụng dữ liệu cho mục đích quảng cáo.',
  },
  {
    title: '3. Chia sẻ dữ liệu',
    content: 'Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba. Việc chia sẻ (nếu có) chỉ giới hạn trong phạm vi vận hành dịch vụ và có ký thỏa thuận bảo mật.',
  },
  {
    title: '4. Quyền của người dùng',
    content: 'Bạn có quyền truy xuất, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào trong phạm vi các tính năng hiện có trên nền tảng.',
  },
];

export default function PrivacyPage() {
  return (
    <PageTransition>
      <div className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-background">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Pháp lý</p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Chính Sách Bảo Mật</h1>
          <p className="mt-3 text-muted-foreground">Chúng tôi coi trọng quyền riêng tư của bạn. Tài liệu này giải thích cách chúng tôi xử lý dữ liệu.</p>
          <p className="mt-2 text-xs text-muted-foreground/70">Cập nhật lần cuối: 17/02/2026</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-1">
          {sections.map((section, i) => (
            <section
              key={i}
              className="group rounded-2xl p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {i + 1}
                </span>
                {section.title.replace(/^\d+\.\s*/, '')}
              </h2>
              <p className="pl-8 text-sm leading-7 text-muted-foreground">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-6 text-sm">
          <p className="font-semibold text-foreground mb-1">Câu hỏi về quyền riêng tư?</p>
          <p className="text-muted-foreground">
            Liên hệ chúng tôi qua{' '}
            <a href="mailto:support@cvbuilder.com" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              support@cvbuilder.com
            </a>
            .
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
