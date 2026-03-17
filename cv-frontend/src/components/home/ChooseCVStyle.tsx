'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getTemplate, TemplateRegistryItem } from '@/templates/registry';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Sparkles, CheckCircle2, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplateApiItem {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  is_premium?: boolean | null;
  is_active?: boolean | null;
}

type AvailableTemplate = TemplateRegistryItem & {
  dbName?: string;
  dbDescription?: string;
  isPremium?: boolean;
  thumbnailUrl?: string | null;
};

interface ChooseCVStyleProps {
  initialTemplates: TemplateApiItem[];
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    modern: 'Hiện đại',
    classic: 'Cổ điển',
    tech: 'Công nghệ',
    creative: 'Sáng tạo',
    academic: 'Học thuật',
  };
  return map[category] || 'Cơ bản';
};

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    modern: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    classic: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    tech: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    creative: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    academic: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  };
  return map[category] || 'bg-gray-100 text-gray-700';
};

function MiniTemplateCard({ template, index }: { template: AvailableTemplate; index: number }) {
  const TemplateComponent = template.component;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const displayName = useMemo(() => template.dbName || template.name, [template.dbName, template.name]);
  const displayDescription = useMemo(() => template.dbDescription || template.description, [template.dbDescription, template.description]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // A4 width in pixels at 96dpi = ~793.7px
        // We want to scale it down to fit in the container
        const calculatedScale = containerWidth / 793.7;
        setScale(Number(calculatedScale.toFixed(4)));
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div 
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      {/* Preview Area - Compact */}
      <div 
        ref={containerRef}
        className="relative w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 overflow-hidden border-b border-gray-100 dark:border-slate-700"
        style={{ aspectRatio: '210/297' }}
      >
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span className="text-[9px] font-bold text-green-600 uppercase">ATS</span>
          </div>
          
          {template.featured && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-md shadow-md">
              <Star className="h-2.5 w-2.5 fill-white" />
              <span className="text-[9px] font-bold uppercase">Hot</span>
            </div>
          )}
          
          {template.isPremium && !template.featured && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2 py-1 rounded-md shadow-md">
              <Zap className="h-2.5 w-2.5 fill-white" />
              <span className="text-[9px] font-bold uppercase">Pro</span>
            </div>
          )}
        </div>

        <motion.div 
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{
            width: '793.7px',
            height: '1122.8px',
            transform: `scale(${scale})`,
          }}
        >
          <TemplateComponent data={template.sampleData} previewMode={true} />
        </motion.div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button className="rounded-full bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg h-9 px-4 text-xs" asChild>
            <Link href={`/editor?template=${template.id}`}>
              <Sparkles className="mr-1.5 h-3 w-3" />
              Dùng mẫu này
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Area - Compact */}
      <div className="flex flex-col flex-1 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate flex-1">
            {displayName}
          </h3>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ml-2 whitespace-nowrap ${getCategoryColor(template.category)}`}>
            {getCategoryLabel(template.category)}
          </span>
        </div>
        
        <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {displayDescription}
        </p>

        <Button 
          className="w-full h-8 rounded-lg bg-gray-900 dark:bg-slate-100 dark:text-slate-900 text-white font-semibold text-xs shadow-md hover:bg-blue-600 hover:shadow-blue-500/25 transition-all"
          asChild
        >
          <Link href={`/editor?template=${template.id}`}>
            <Sparkles className="mr-1.5 h-3 w-3" />
            Tạo CV Ngay
          </Link>
        </Button>
      </div>

      {/* Index badge */}
      <div className="absolute right-2 top-2 pointer-events-none">
        <div className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900/80 dark:bg-white/80 px-1.5 text-[10px] font-bold text-white dark:text-gray-900">
          {index + 1}
        </div>
      </div>
    </motion.div>
  );
}

export function ChooseCVStyle({ initialTemplates }: ChooseCVStyleProps) {
  const templates = useMemo<AvailableTemplate[]>(() => {
    return initialTemplates
      .filter((template) => template.is_active !== false)
      .flatMap((template) => {
        const registryTemplate = getTemplate(template.id);
        if (!registryTemplate) {
          return [];
        }

        return [
          {
            ...registryTemplate,
            dbName: template.name,
            dbDescription: registryTemplate.description,
            isPremium: Boolean(template.is_premium),
            thumbnailUrl: template.thumbnail_url,
          },
        ];
      })
      .slice(0, 4);
  }, [initialTemplates]);

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-900 py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Professional CV Templates
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Chọn phong cách CV{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                phù hợp bạn
              </span>
            </h2>
            <p className="mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-300">
              Khám phá bộ sưu tập mẫu CV chuyên nghiệp, được thiết kế tối ưu cho ATS và tăng cơ hội được tuyển dụng.
            </p>
          </div>
          <Button asChild variant="outline" className="h-10 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-semibold text-sm hover:border-blue-500 hover:text-blue-600">
            <Link href="/templates">
              Xem tất cả mẫu CV
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Hiện chưa có mẫu CV khả dụng.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, index) => (
              <MiniTemplateCard 
                key={template.id} 
                template={template} 
                index={index}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bạn cần hỗ trợ?{" "}
            <Link href="/guides" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
              Xem hướng dẫn viết CV
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
