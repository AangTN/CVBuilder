const steps = [
  {
    title: "Chọn mẫu",
    description: "Lựa chọn template phù hợp vị trí bạn ứng tuyển và phong cách cá nhân.",
  },
  {
    title: "Điền nội dung",
    description: "Cập nhật thông tin theo từng section có sẵn hướng dẫn rõ ràng.",
  },
  {
    title: "Xuất CV",
    description: "Tải PDF và nộp ứng tuyển ngay, không cần căn chỉnh bố cục thủ công.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">3 Steps</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Quy trình tạo CV rất đơn giản
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Toàn bộ trải nghiệm được tối ưu để bạn tập trung vào nội dung quan trọng nhất.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-black text-white">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
