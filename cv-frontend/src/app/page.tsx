import Link from "next/link";
import { FileText, Download, LayoutTemplate, Sparkles, CheckCircle2, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CV Builder",
  url: siteUrl,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CV Builder",
  url: siteUrl,
  inLanguage: "vi-VN",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/templates?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const features = [
  {
    title: "Mẫu CV đẹp & chuẩn ATS",
    description: "Thiết kế chuyên nghiệp, tương thích hệ thống lọc hồ sơ tự động của nhà tuyển dụng.",
    icon: LayoutTemplate,
  },
  {
    title: "Chỉnh sửa trực quan",
    description: "Giao diện kéo-thả đơn giản, điền thông tin theo từng mục rõ ràng.",
    icon: Sparkles,
  },
  {
    title: "Xuất PDF chất lượng cao",
    description: "Tải xuống CV dưới dạng PDF sắc nét, sẵn sàng nộp cho nhà tuyển dụng.",
    icon: Download,
  },
];

const steps = [
  { label: "Chọn mẫu CV", desc: "Chọn từ nhiều mẫu phù hợp ngành nghề và phong cách của bạn." },
  { label: "Điền thông tin", desc: "Điền nội dung theo hướng dẫn từng bước, tối ưu đúng từ khóa JD." },
  { label: "Tải về & ứng tuyển", desc: "Xuất file PDF chuẩn, gửi thẳng cho nhà tuyển dụng." },
];

const stats = [
  { value: "5+", label: "Mẫu CV chuyên nghiệp", icon: LayoutTemplate },
  { value: "100%", label: "Miễn phí sử dụng", icon: Star },
  { value: "<15 phút tạo", label: "Thời gian tạo CV", icon: Clock },
  { value: "ATS Ready", label: "Tương thích hệ thống lọc", icon: Users },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/*  HERO  */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-blue-50 via-white to-sky-50/50 dark:from-slate-950 dark:via-background dark:to-slate-900/50">
        <div className="pointer-events-none absolute -left-32 -top-16 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

        <div className="container relative mx-auto grid gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          {/* Left */}
          <div className="flex flex-col">
            <span className="mb-5 inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400">
               Công cụ tạo CV miễn phí, đơn giản và đẹp
            </span>

            <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl pb-1">
              Tạo CV ấn tượng
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-400 pb-2">
                trong vài phút
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Chọn mẫu phù hợp, điền thông tin theo từng bước rõ ràng  và nhận CV PDF chuẩn ATS để ứng tuyển ngay.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group h-12 px-7 font-semibold shadow-lg shadow-blue-600/25 dark:shadow-blue-900/20">
                <Link href="/templates">
                  <FileText className="mr-2 h-5 w-5 transition-transform group-hover:-rotate-6" />
                  Tạo CV ngay  Miễn phí
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                <Link href="/guides">Xem hướng dẫn </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Không cần đăng ký
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Xuất PDF không giới hạn
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Lưu & chỉnh sửa bất kỳ lúc nào
              </span>
            </div>
          </div>

          {/* Right  Feature card */}
          <div className="relative lg:pl-6">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-100 blur-xl dark:from-blue-900/20 dark:to-sky-900/20" />
            <div className="relative rounded-3xl border bg-white/90 p-6 shadow-2xl shadow-blue-100/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-none sm:p-8">
              <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tính năng nổi bật</h2>
              <ul className="space-y-5">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.title} className="flex gap-4">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-bold text-foreground">{f.title}</h3>
                        <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{f.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                 Tất cả mẫu CV đều đạt chuẩn ATS  Tăng cơ hội vượt vòng lọc hồ sơ tự động
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  STATS  */}
      <section className="border-b bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-10">
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl border bg-card px-4 py-5 text-center shadow-sm">
                  <Icon className="mb-1 h-5 w-5 text-blue-500 dark:text-blue-400" />
                  <dt className="text-2xl font-black text-foreground">{s.value}</dt>
                  <dd className="text-xs text-muted-foreground">{s.label}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            3 bước để có CV chuyên nghiệp
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Quy trình tối giản, không rườm rà  hoàn thành trong vài phút.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <article key={step.label} className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-800">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white dark:bg-blue-500">
                {i + 1}
              </span>
              <h3 className="font-bold text-foreground">{step.label}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/*  CTA  */}
      <section className="border-t bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:border-slate-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white dark:text-slate-100 sm:text-4xl">
            Bắt đầu tạo CV ngay hôm nay
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100 dark:text-slate-400">
            Miễn phí hoàn toàn. Không cần cài đặt. Sẵn sàng trong vài phút.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="h-12 px-8 font-semibold dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
              <Link href="/templates">
                <FileText className="mr-2 h-5 w-5" />
                Chọn mẫu CV miễn phí
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-transparent border-white/40 dark:border-slate-600 font-semibold text-white dark:text-slate-200 hover:bg-white/15 dark:hover:bg-slate-800 hover:text-white dark:border-slate-600">
              <Link href="/guides">Xem hướng dẫn</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}