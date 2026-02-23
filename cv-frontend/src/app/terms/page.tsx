import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ - CV Builder',
  description: 'Quy định sử dụng dịch vụ tạo CV online. Đọc kỹ để hiểu quyền lợi và trách nhiệm của bạn khi sử dụng CV Builder.',
  openGraph: {
    title: 'Điều Khoản Dịch Vụ - CV Builder',
    description: 'Quy định và điều khoản sử dụng dịch vụ CV Builder.',
    type: 'website',
  },
  alternates: {
    canonical: '/terms',
  },
};

const clauses = [
  {
    title: 'Chấp nhận điều khoản',
    content: 'Bằng việc truy cập hoặc sử dụng dịch vụ, bạn đồng ý bị ràng buộc bởi các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.',
  },
  {
    title: 'Trách nhiệm người dùng',
    content: 'Bạn chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của toàn bộ nội dung CV do bạn tự cung cấp. Nghiêm cấm sử dụng dịch vụ cho các mục đích vi phạm pháp luật.',
  },
  {
    title: 'Giới hạn trách nhiệm',
    content: 'Dịch vụ được cung cấp trên cơ sở "nguyên trạng" và có thể thay đổi hoặc tạm ngừng để cải thiện chất lượng mà không cần thông báo trước.',
  },
  {
    title: 'Cập nhật điều khoản',
    content: 'Chúng tôi có thể cập nhật điều khoản theo thời gian để phản ánh thay đổi dịch vụ hoặc yêu cầu pháp lý. Phiên bản mới sẽ có hiệu lực ngay khi được đăng tải.',
  },
];

export default function TermsPage() {
  return (
    <PageTransition>
      <div className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-background">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Pháp lý</p>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Điều Khoản Dịch Vụ</h1>
          <p className="mt-3 text-muted-foreground">Vui lòng đọc kỹ trước khi sử dụng dịch vụ của chúng tôi.</p>
          <p className="mt-2 text-xs text-muted-foreground/70">Cập nhật lần cuối: 17/02/2026</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-1">
          {clauses.map((clause, i) => (
            <section
              key={i}
              className="group rounded-2xl p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {i + 1}
                </span>
                {clause.title}
              </h2>
              <p className="pl-8 text-sm leading-7 text-muted-foreground">{clause.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-6 text-sm">
          <p className="font-semibold text-foreground mb-1">Lưu ý quan trọng</p>
          <p className="text-muted-foreground">
            Bằng việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật, bạn mặc nhiên chấp nhận các điều khoản mới.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
