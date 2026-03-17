import { Bot, Download, Layers3, SlidersHorizontal, WandSparkles } from "lucide-react";

const bentoItems = [
  {
    title: "Tối ưu ATS thông minh",
    description:
      "Gợi ý cấu trúc nội dung và trình bày để CV dễ được hệ thống tự động đọc đúng thông tin quan trọng.",
    icon: Bot,
    className: "md:col-span-2",
    tone: "bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800",
  },
  {
    title: "Kho templates đa dạng",
    description: "Lựa chọn nhiều phong cách: modern, creative, tech và academic theo ngành nghề.",
    icon: Layers3,
    className: "md:col-span-1",
    tone: "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700",
  },
  {
    title: "Editor dễ sử dụng",
    description: "Form rõ ràng, cập nhật theo từng section, không cần kỹ năng thiết kế.",
    icon: SlidersHorizontal,
    className: "md:col-span-1",
    tone: "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700",
  },
  {
    title: "Xuất PDF 1 chạm",
    description: "File PDF sắc nét, bố cục ổn định, sẵn sàng gửi nhà tuyển dụng ngay lập tức.",
    icon: Download,
    className: "md:col-span-2",
    tone: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800",
  },
  {
    title: "Tùy chỉnh nhanh màu sắc và nội dung",
    description: "Điều chỉnh nội dung linh hoạt để phù hợp từng vị trí ứng tuyển mà vẫn giữ bố cục đẹp.",
    icon: WandSparkles,
    className: "md:col-span-3",
    tone: "bg-slate-900 border-slate-800 text-white",
  },
];

export function FeatureBento() {
  return (
    <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] py-16 dark:border-slate-800 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Feature Bento</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Mỗi tính năng được thiết kế để bạn ứng tuyển nhanh hơn
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {bentoItems.map((item) => {
            const Icon = item.icon;
            const darkCard = item.tone.includes("text-white");

            return (
              <article
                key={item.title}
                className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.className} ${item.tone}`}
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${darkCard ? "bg-white/10" : "bg-white dark:bg-slate-800"}`}>
                  <Icon className={`h-5 w-5 ${darkCard ? "text-white" : "text-sky-600 dark:text-sky-300"}`} />
                </div>
                <h3 className={`mt-4 text-lg font-extrabold ${darkCard ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{item.title}</h3>
                <p className={`mt-2 text-sm leading-6 ${darkCard ? "text-slate-200" : "text-slate-600 dark:text-slate-300"}`}>{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
