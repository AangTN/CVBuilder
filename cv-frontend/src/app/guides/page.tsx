import Link from 'next/link';
import type { Metadata } from 'next';
import { PageTransition } from '@/components/ui/page-transition';

export const metadata: Metadata = {
  title: 'Hướng Dẫn Viết CV - Mẹo Viết CV Chuẩn ATS Hiệu Quả',
  description:
    'Hướng dẫn từng bước để tạo CV chuyên nghiệp, sắp xếp bố cục hợp lý và tối ưu từ khóa giúp tăng 80% cơ hội qua vòng lọc hồ sơ.',
  openGraph: {
    title: 'Hướng Dẫn Viết CV - Mẹo Viết CV Chuẩn ATS Hiệu Quả',
    description: 'Hướng dẫn từng bước tạo CV chuyên nghiệp, tăng cơ hội trúng tuyển.',
    type: 'website',
  },
  alternates: {
    canonical: '/guides',
  },
};

const steps = [
  'Chọn template phù hợp vị trí ứng tuyển',
  'Điền thông tin cá nhân ngắn gọn, chuyên nghiệp',
  'Viết kinh nghiệm theo kết quả + số liệu cụ thể',
  'Tối ưu từ khóa theo JD để tăng ATS match',
  'Xuất PDF và kiểm tra lại bố cục trước khi gửi',
];

export default function GuidesPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-black tracking-tight">Hướng Dẫn CV</h1>
        <p className="mt-2 text-muted-foreground">Quy trình 5 bước để tạo CV hiệu quả.</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Visual Guide */}
          <div className="col-span-full rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-8 dark:from-blue-950/20 dark:to-sky-950/20 border border-blue-100 dark:border-blue-900/50">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6">Quy trình 5 bước chuẩn hóa</h2>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, index) => (
                <li key={step} className="relative flex flex-col items-start gap-3 group">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-blue-600 shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:text-blue-400 dark:ring-blue-900 transition-transform group-hover:scale-110">
                    {index + 1}
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{step}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-5 left-12 right-[-20px] h-0.5 bg-blue-200/50 dark:bg-blue-800/30" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
               <span className="text-emerald-500">✔</span> Nên làm
             </h3>
             <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-emerald-500">
               <li>Dùng các từ khóa có trong mô tả công việc (JD).</li>
               <li>Sử dụng định dạng PDF chuẩn để tránh lỗi font.</li>
               <li>Định lượng thành tích bằng con số cụ thể.</li>
             </ul>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
             <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
               <span className="text-red-500">✘</span> Nên tránh
             </h3>
             <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-red-500">
               <li>Dùng thanh kỹ năng (skill bar) khó đọc cho máy.</li>
               <li>Sai lỗi chính tả hoặc ngữ pháp cơ bản.</li>
               <li>Dùng địa chỉ email thiếu chuyên nghiệp.</li>
             </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center">
             <h3 className="font-bold text-lg mb-2">Bạn đã sẵn sàng?</h3>
             <p className="text-sm text-muted-foreground mb-4">Áp dụng kiến thức vừa học vào mẫu CV chuyên nghiệp của chúng tôi.</p>
             <Link 
               href="/templates" 
               className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
             >
               Tạo CV Ngay
             </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
