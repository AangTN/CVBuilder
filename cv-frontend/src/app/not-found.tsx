import Link from 'next/link';
import { Home, FileText, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Không Tìm Thấy Trang',
  description: 'Trang bạn tìm kiếm không tồn tại.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-7 w-7 text-muted-foreground" />
        </div>

        <p className="text-sm font-semibold text-primary">404 - Không tìm thấy trang</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Liên kết này không còn tồn tại
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Trang bạn đang tìm có thể đã bị đổi đường dẫn hoặc bị xóa. Bạn có thể quay về trang chủ
          hoặc bắt đầu tạo CV từ thư viện mẫu.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/templates">
              <FileText className="mr-2 h-4 w-4" />
              Xem mẫu CV
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}