'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getTemplate, TemplateRegistryItem } from '@/templates/registry';
import { CVData } from '@/lib/types';
import { Check, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/features/api';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTemplateId: string;
  currentData: CVData;
  onTemplateSelect: (templateId: string) => void;
}

interface TemplateApiItem {
  id: string;
  is_active?: boolean | null;
}

function TemplateThumbnail({ template }: { template: TemplateRegistryItem }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.2);

  React.useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      setScale(containerWidth / 793.7);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: '210mm',
          height: '297mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <template.component data={template.sampleData} previewMode />
      </div>
    </div>
  );
}

export function TemplatePreviewModal({
  open,
  onOpenChange,
  currentTemplateId,
  currentData,
  onTemplateSelect,
}: TemplatePreviewModalProps) {
  const [templates, setTemplates] = React.useState<TemplateRegistryItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>(currentTemplateId);
  const [previewTemplate, setPreviewTemplate] = React.useState<TemplateRegistryItem | null>(null);

  const fetchAvailableTemplates = React.useCallback(async () => {
    setLoadingTemplates(true);

    try {
      const apiTemplates = await api.getTemplates() as TemplateApiItem[];

      const availableTemplates = apiTemplates.flatMap((template) => {
        if (template.is_active === false) {
          return [];
        }

        const registryTemplate = getTemplate(template.id);
        if (!registryTemplate) {
          return [];
        }

        return [registryTemplate];
      });

      setTemplates(availableTemplates);
      setLoadError(null);
      setSelectedTemplate((previousValue) => {
        if (availableTemplates.some((template) => template.id === previousValue)) {
          return previousValue;
        }

        if (availableTemplates.some((template) => template.id === currentTemplateId)) {
          return currentTemplateId;
        }

        return availableTemplates[0]?.id || '';
      });
    } catch (error) {
      console.error('Error fetching templates for modal:', error);
      setTemplates([]);
      setLoadError('Không thể tải danh sách template từ máy chủ.');
      setSelectedTemplate('');
    } finally {
      setLoadingTemplates(false);
    }
  }, [currentTemplateId]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    void fetchAvailableTemplates();
  }, [fetchAvailableTemplates, open]);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleApply = () => {
    if (!selectedTemplate) {
      onOpenChange(false);
      return;
    }

    if (selectedTemplate !== currentTemplateId) {
      const confirmed = window.confirm(
        'Thay đổi template sẽ áp dụng kiểu hiển thị mới cho CV của bạn. Dữ liệu sẽ được giữ nguyên. Tiếp tục?'
      );
      if (confirmed) {
        onTemplateSelect(selectedTemplate);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handlePreview = (template: TemplateRegistryItem) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Chọn Template CV</DialogTitle>
            <DialogDescription>
              Chọn một template phù hợp với phong cách của bạn. Dữ liệu CV sẽ được giữ nguyên.
            </DialogDescription>
          </DialogHeader>

          {loadingTemplates ? (
            <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[260px] animate-pulse rounded-lg border-2 border-gray-200 bg-gray-100" />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <p className="text-sm">{loadError}</p>
              <Button variant="outline" className="mt-3" onClick={() => void fetchAvailableTemplates()}>
                Tải lại
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
              Không có template khả dụng từ DB.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-2">
              {templates.map((template) => {
                const isSelected = template.id === selectedTemplate;
                const isCurrent = template.id === currentTemplateId;

                return (
                  <div
                    key={template.id}
                    className={cn(
                      'relative group rounded-lg border-2 transition-all cursor-pointer overflow-hidden',
                      isSelected
                        ? 'border-blue-500 shadow-lg ring-4 ring-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    )}
                    onClick={() => handleSelect(template.id)}
                  >
                    {/* Template Preview Thumbnail */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(template);
                          }}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Xem trước
                        </Button>
                      </div>

                      {/* Mini preview */}
                      <TemplateThumbnail template={template} />
                    </div>

                    {/* Template Info */}
                    <div className="p-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {template.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      {isCurrent && (
                        <div className="mt-2">
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Đang sử dụng
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-500">
              {selectedTemplate && selectedTemplate === currentTemplateId
                ? 'Template hiện tại'
                : selectedTemplate
                  ? 'Template mới được chọn'
                  : 'Không có template để chọn'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handleApply} disabled={!selectedTemplate}>
                {selectedTemplate === currentTemplateId ? 'Đóng' : 'Áp dụng Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={closePreview}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-6 rounded shadow-sm">
                <previewTemplate.component data={currentData} previewMode />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closePreview}>
                Đóng
              </Button>
              <Button
                onClick={() => {
                  handleSelect(previewTemplate.id);
                  closePreview();
                }}
              >
                Chọn Template Này
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
