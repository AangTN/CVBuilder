'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/features/api';
import { getTemplate, TemplateRegistryItem } from '@/templates/registry';

interface TemplateApiItem {
  id: string;
  name: string;
  is_active?: boolean | null;
}

interface HighlightTemplate {
  id: string;
  name: string;
  category: string;
  summary: string;
  href: string;
  palette: string;
}

const CATEGORY_LABELS: Record<TemplateRegistryItem['category'], string> = {
  modern: 'Modern',
  classic: 'Classic',
  tech: 'Tech',
  creative: 'Creative',
  academic: 'Academic',
};

const CATEGORY_PALETTES: Record<TemplateRegistryItem['category'], string> = {
  modern: 'from-sky-500 to-blue-600',
  classic: 'from-slate-600 to-slate-800',
  tech: 'from-slate-700 to-slate-900',
  creative: 'from-cyan-500 to-teal-500',
  academic: 'from-indigo-500 to-blue-700',
};

export function TemplateHighlights() {
  const [templates, setTemplates] = useState<HighlightTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);

      try {
        const apiTemplates = await api.getTemplates() as TemplateApiItem[];
        const availableTemplates = apiTemplates
          .filter((template) => template.is_active !== false)
          .flatMap((template) => {
            const registryTemplate = getTemplate(template.id);
            if (!registryTemplate) {
              return [];
            }

            return [
              {
                id: template.id,
                name: template.name || registryTemplate.name,
                category: CATEGORY_LABELS[registryTemplate.category],
                summary: registryTemplate.description,
                href: `/editor?template=${template.id}`,
                palette: CATEGORY_PALETTES[registryTemplate.category],
              },
            ];
          })
          .slice(0, 4);

        setTemplates(availableTemplates);
      } catch (error) {
        console.error('Error fetching template highlights:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, []);

  return (
    <section className="relative border-b border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Template Highlights</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Chọn phong cách CV phù hợp bạn
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Mỗi mẫu đã được tối ưu để dễ đọc, dễ scan ATS và dễ in ấn khi cần nộp bản cứng.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-xl border-sky-300 font-semibold text-sky-700 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800">
            <Link href="/templates">
              Xem tất cả templates
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[290px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Hiện chưa có template khả dụng từ DB.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {templates.map((template, idx) => (
              <article
                key={template.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <div className={`h-32 bg-gradient-to-br ${template.palette} p-4 text-white`}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">{template.category}</p>
                  <h3 className="mt-3 text-xl font-extrabold leading-tight">{template.name}</h3>
                </div>

                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <div className="h-2 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>

                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{template.summary}</p>

                  <Button asChild className="h-10 w-full rounded-lg font-semibold">
                    <Link href={template.href}>
                      <FileText className="mr-2 h-4 w-4" />
                      Dùng mẫu này
                    </Link>
                  </Button>
                </div>

                <div className="pointer-events-none absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-[11px] font-bold text-white backdrop-blur">
                  {idx + 1}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
