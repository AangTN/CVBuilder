import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeFinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-transparent bg-gradient-to-r from-sky-700 via-blue-700 to-cyan-600 py-16 text-white dark:border-slate-800 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_120%_at_0%_100%,rgba(255,255,255,0.18),transparent_48%),radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.14),transparent_52%)]" />
      <div className="container relative mx-auto px-4 text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Sẵn sàng gửi CV đẹp và chuyên nghiệp ngay hôm nay?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-sky-100 sm:text-lg">
          Bắt đầu với một mẫu có sẵn, chỉnh sửa trong vài phút và tải xuống bản PDF để ứng tuyển ngay.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="h-12 rounded-xl px-8 font-semibold text-slate-900 hover:bg-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
            <Link href="/templates">
              <FileText className="mr-2 h-5 w-5" />
              Bắt đầu miễn phí
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-xl border-white/45 bg-transparent px-8 font-semibold text-white hover:bg-white/15 hover:text-white dark:border-slate-300/45"
          >
            <Link href="/guides">
              Xem hướng dẫn tối ưu CV
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
