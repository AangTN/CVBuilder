'use client';

import { TemplateCard } from "@/templates/TemplateCard";
import { getAllTemplates, getTemplate } from "@/templates/registry";
import type { TemplateRegistryItem } from "@/templates/registry";
import { PageTransition } from "@/components/ui/page-transition";
import { FadeIn } from "@/components/ui/fade-in";
import { TemplateCardSkeleton } from "@/components/ui/card-skeleton";
import { Search, CheckCircle2, Layers, Briefcase, Cpu, Palette, GraduationCap } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/features/api";
import { Button } from "@/components/ui/button";

interface TemplateApiItem {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  credit_cost?: number | null;
  is_premium?: boolean | null;
  is_active?: boolean | null;
}

type AvailableTemplate = TemplateRegistryItem & {
  dbName?: string;
  dbDescription?: string;
  isPremium?: boolean;
  creditCost?: number;
  thumbnailUrl?: string | null;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AvailableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const buildLocalTemplates = useCallback((): AvailableTemplate[] => {
    return getAllTemplates().map((template) => ({
      ...template,
      isPremium: false,
      creditCost: 0,
      thumbnailUrl: null,
    }));
  }, []);

  const CATEGORY_FILTERS = [
    { value: 'all', label: 'Tất cả', icon: Layers },
    { value: 'modern', label: 'Hiện đại', icon: Palette },
    { value: 'classic', label: 'Cổ điển', icon: Briefcase },
    { value: 'tech', label: 'Công nghệ', icon: Cpu },
    { value: 'academic', label: 'Học thuật', icon: GraduationCap },
  ];
  
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const apiTemplates = await api.getTemplates() as TemplateApiItem[];

      const availableTemplates: AvailableTemplate[] = apiTemplates.flatMap((apiTemplate) => {
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

      const localTemplates = buildLocalTemplates()
        .filter((template) => !availableTemplates.some((item) => item.id === template.id));

      setTemplates([...availableTemplates, ...localTemplates]);
      setError(null);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(buildLocalTemplates());
      setError('Không thể kết nối máy chủ, đang hiển thị mẫu cục bộ.');
    } finally {
      setLoading(false);
    }
  }, [buildLocalTemplates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  
  const filteredTemplates = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.toLowerCase().trim();
    let result = templates;

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (!normalizedQuery) {
      return result;
    }

    return result.filter((template) =>
      (template.dbName || template.name).toLowerCase().includes(normalizedQuery) ||
      (template.dbDescription || template.description).toLowerCase().includes(normalizedQuery)
    );
  }, [deferredSearchQuery, selectedCategory, templates]);
  
  return (
    <PageTransition>
      <div className="container mx-auto py-12 px-4 mt-4">
        <FadeIn>
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Chọn Mẫu CV{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                Hoàn Hảo
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
              Chọn từ các mẫu CV được thiết kế chuyên nghiệp để tạo CV nổi bật của bạn.
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-8 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-foreground">{templates.length} mẫu có sẵn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-foreground">Chuẩn ATS</span>
              </div>
            </div>
            
            {/* Category Filter */}
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
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === value ? 'bg-blue-500/40' : 'bg-muted'
                    }`}>
                      {templates.filter(t => t.category === value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-xl mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm mẫu CV..."
                  aria-label="Tìm kiếm mẫu CV"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-left">
                Tìm thấy {filteredTemplates.length} mẫu
              </div>
            </div>
          </div>
        </FadeIn>
        
        {error && (
          <FadeIn>
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <p className="text-sm md:text-base">{error}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 border-amber-300 bg-white hover:bg-amber-100"
                onClick={() => void fetchTemplates()}
              >
                Thử kết nối lại
              </Button>
            </div>
          </FadeIn>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
        
        {!loading && filteredTemplates.length === 0 && (
          <FadeIn>
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Không tìm thấy mẫu CV phù hợp.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
