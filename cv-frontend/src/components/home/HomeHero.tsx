import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickFacts = [
  "Không cần đăng ký",
  "Xuất PDF chất lượng cao",
  "Tối ưu ATS cho nhà tuyển dụng",
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(130%_130%_at_0%_0%,rgba(14,165,233,0.18),transparent_50%),radial-gradient(120%_120%_at_100%_100%,rgba(59,130,246,0.14),transparent_50%)] dark:border-slate-800 dark:bg-[radial-gradient(130%_130%_at_0%_0%,rgba(14,165,233,0.2),transparent_50%),radial-gradient(120%_120%_at_100%_100%,rgba(59,130,246,0.16),transparent_50%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="home-grid-bg pointer-events-none absolute inset-0 opacity-60 dark:opacity-30" />
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/15" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/15" />

      <div className="container relative mx-auto grid gap-10 px-4 py-14 sm:py-18 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
        <div className="home-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 shadow-sm backdrop-blur dark:border-sky-700 dark:bg-slate-900/80 dark:text-sky-300">
            CV Builder 2026
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            CV đẹp, chuẩn ATS,
            <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 bg-clip-text pb-1 text-transparent">
              tạo trong vài phút.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            Chọn mẫu CV theo ngành nghề, chỉnh sửa trực quan từng mục, sau đó tải file PDF sẵn sàng ứng tuyển.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 rounded-xl px-7 text-base font-semibold shadow-xl shadow-blue-500/25">
              <Link href="/templates">
                <FileText className="mr-2 h-5 w-5" />
                Chọn mẫu và bắt đầu
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-sky-300 bg-white/70 px-7 font-semibold dark:border-sky-700 dark:bg-slate-900/70 dark:text-sky-200 dark:hover:bg-slate-800">
              <Link href="/editor">
                Mở trình chỉnh sửa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
            {quickFacts.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-fade-up home-delay-1 relative">
          <div className="home-float rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_30px_80px_-30px_rgba(2,132,199,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  Live Editor
                </span>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_1fr]">
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="h-8 rounded-md bg-white dark:bg-slate-700" />
                  <div className="h-8 rounded-md bg-white dark:bg-slate-700" />
                  <div className="h-20 rounded-md bg-white dark:bg-slate-700" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-md bg-white dark:bg-slate-700" />
                    <div className="h-8 rounded-md bg-white dark:bg-slate-700" />
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="absolute right-2 top-2 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                    PDF Preview
                  </div>
                  <div className="space-y-2.5 pt-6">
                    <div className="h-2.5 w-20 rounded bg-sky-200" />
                    <div className="h-2.5 w-full rounded bg-slate-200 dark:bg-slate-600" />
                    <div className="h-2.5 w-5/6 rounded bg-slate-200 dark:bg-slate-600" />
                    <div className="h-2.5 w-2/3 rounded bg-slate-200 dark:bg-slate-600" />
                    <div className="mt-4 h-16 rounded bg-slate-100 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Editor trực quan</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">Cập nhật nội dung theo từng section rõ ràng.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <Download className="h-3.5 w-3.5" />
                  Xuất nhanh
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">Tải PDF ngay sau khi hoàn tất trong 1 click.</p>
              </div>
            </div>
          </div>

          <div className="home-fade-up home-delay-2 absolute -right-3 -top-4 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              ATS Ready Layout
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
