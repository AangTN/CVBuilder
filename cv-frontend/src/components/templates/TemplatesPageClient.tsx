'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, CheckCircle2, Layers, Briefcase, Cpu, Palette, GraduationCap } from 'lucide-react';
import { TemplateCard } from '@/templates/TemplateCard';
import { getTemplate } from '@/templates/registry';
import type { TemplateRegistryItem } from '@/templates/registry';
import type { TemplateApiResponse } from '@/features/api/types';
import { PageTransition } from '@/components/ui/page-transition';
import { FadeIn } from '@/components/ui/fade-in';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type AvailableTemplate = TemplateRegistryItem & {
  dbName?: string;
  dbDescription?: string;
  isPremium?: boolean;
  creditCost?: number;
  thumbnailUrl?: string | null;
};

interface TemplatesPageClientProps {
  initialApiTemplates: TemplateApiResponse[];
}

export function TemplatesPageClient({
  initialApiTemplates,
}: TemplatesPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const CATEGORY_FILTERS = [
    { value: 'all', label: 'Tất cả', icon: Layers },
    { value: 'modern', label: 'Hiện đại', icon: Palette },
    { value: 'classic', label: 'Cổ điển', icon: Briefcase },
    { value: 'tech', label: 'Công nghệ', icon: Cpu },
    { value: 'academic', label: 'Học thuật', icon: GraduationCap },
  ];

  const templates = useMemo<AvailableTemplate[]>(() => {
    return initialApiTemplates.flatMap((apiTemplate) => {
      if (apiTemplate.is_active === false) {
        return [];
      }

      const registryTemplate = getTemplate(apiTemplate.id);
      if (!registryTemplate) {
        return [];
      }

      return [
        {
          ...registryTemplate,
          dbName: apiTemplate.name,
          dbDescription: registryTemplate.description,
          isPremium: Boolean(apiTemplate.is_premium),
          creditCost: apiTemplate.credit_cost ?? 0,
          thumbnailUrl: apiTemplate.thumbnail_url,
        },
      ];
    });
  }, [initialApiTemplates]);

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.toLowerCase().trim();
    let result = templates;

    if (selectedCategory !== 'all') {
      result = result.filter((template) => template.category === selectedCategory);
    }

    if (!normalizedQuery) {
      return result;
    }

    return result.filter((template) =>
      (template.dbName || template.name).toLowerCase().includes(normalizedQuery) ||
      (template.dbDescription || template.description)
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [deferredSearchQuery, selectedCategory, templates]);

  return (
    <PageTransition>
      <div className="container mx-auto py-12 px-4 mt-4">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Chọn Mẫu CV{' '}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                Hoàn Hảo
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
              Chọn từ các mẫu CV được thiết kế chuyên nghiệp để tạo CV nổi bật của bạn.
            </p>

            <div className="flex items-center gap-8 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-foreground">
                  {templates.length} mẫu có sẵn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-foreground">Chuẩn ATS</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {CATEGORY_FILTERS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-background text-muted-foreground border-border hover:border-blue-400 hover:text-blue-600'
                  }`}
                  aria-pressed={selectedCategory === value}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                  {value !== 'all' && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedCategory === value ? 'bg-blue-500/40' : 'bg-muted'
                      }`}
                    >
                      {templates.filter((template) => template.category === value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="w-full max-w-xl mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm mẫu CV..."
                  aria-label="Tìm kiếm mẫu CV"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-left">
                Tìm thấy {filteredTemplates.length} mẫu
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <FadeIn>
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy mẫu CV phù hợp.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Xóa tìm kiếm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCategory('all')}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
