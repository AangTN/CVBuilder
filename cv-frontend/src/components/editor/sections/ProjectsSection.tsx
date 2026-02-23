'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface ProjectsSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const standardProjectFields = ['name', 'role', 'start_date', 'end_date', 'description', 'technologies', 'url', 'github_url'];

const PROJECT_TEXTS: Record<Language, {
  itemTitle: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addProject: string;
}> = {
  vi: {
    itemTitle: 'Dự án',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addProject: 'Thêm dự án',
  },
  en: {
    itemTitle: 'Project',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addProject: 'Add project',
  },
  ja: {
    itemTitle: 'プロジェクト',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addProject: 'プロジェクトを追加',
  },
  ko: {
    itemTitle: '프로젝트',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addProject: '프로젝트 추가',
  },
  zh: {
    itemTitle: '项目',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addProject: '添加项目',
  },
};

export function ProjectsSection({ section, language, onUpdate, onToggleVisibility }: ProjectsSectionProps) {
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const text = PROJECT_TEXTS[language] || PROJECT_TEXTS.en;

  const getStringContent = (content: Record<string, unknown>, key: string): string => {
    const value = content[key];
    return typeof value === 'string' ? value : '';
  };

  const getStringArrayContent = (content: Record<string, unknown>, key: string): string[] => {
    const value = content[key];
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === 'string');
  };

  const updateItemField = (itemIndex: number, field: string, value: unknown) => {
    const newItems = [...section.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      content: { ...newItems[itemIndex].content, [field]: value }
    };
    onUpdate(section.id, { items: newItems });
  };

  const removeCustomField = (itemIndex: number, fieldKey: string) => {
    const newItems = [...section.items];
    const restContent = Object.fromEntries(
      Object.entries(newItems[itemIndex].content).filter(([key]) => key !== fieldKey),
    );
    newItems[itemIndex] = { ...newItems[itemIndex], content: restContent };
    onUpdate(section.id, { items: newItems });
  };

  const addCustomFieldInline = (itemIndex: number) => {
    const input = customFieldInputs[itemIndex];
    if (input && input.key.trim() && input.value.trim()) {
      updateItemField(itemIndex, input.key.trim(), input.value.trim());
      setCustomFieldInputs(prev => ({ ...prev, [itemIndex]: { key: '', value: '' } }));
    }
  };

  const getCustomFieldInput = (itemIndex: number) => {
    return customFieldInputs[itemIndex] || { key: '', value: '' };
  };

  return (
    <AccordionItem value="projects">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`text-lg font-semibold flex-1 ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('projects', language)} ({section.items.length})
        </AccordionTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id, section.is_visible ?? true);
          }}
          className="h-8 w-8 p-0"
        >
          {section.is_visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          {section.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border bg-muted/50 p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{text.itemTitle} #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => {
                      const newItems = section.items.filter(i => i.id !== item.id);
                      onUpdate(section.id, { items: newItems });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{getFieldLabel('projects', 'name', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('projects', 'name', language)}
                      value={getStringContent(item.content, 'name')}
                      onChange={(e) => updateItemField(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('projects', 'role', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('projects', 'role', language)}
                      value={getStringContent(item.content, 'role')}
                      onChange={(e) => updateItemField(index, 'role', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{getFieldLabel('projects', 'start_date', language)}</Label>
                    <Input
                      type="month"
                      value={getStringContent(item.content, 'start_date')}
                      onChange={(e) => updateItemField(index, 'start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('projects', 'end_date', language)}</Label>
                    <Input
                      type="month"
                      value={getStringContent(item.content, 'end_date')}
                      onChange={(e) => updateItemField(index, 'end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>{getFieldLabel('projects', 'description', language)}</Label>
                  <Textarea
                    placeholder={getFieldPlaceholder('projects', 'description', language)}
                    rows={3}
                    value={getStringContent(item.content, 'description')}
                    onChange={(e) => updateItemField(index, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <Label>{getFieldLabel('projects', 'technologies', language)}</Label>
                  <Input
                    placeholder={getFieldPlaceholder('projects', 'technologies', language)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          const technologies = getStringArrayContent(item.content, 'technologies');
                          updateItemField(index, 'technologies', [...technologies, value]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getStringArrayContent(item.content, 'technologies').map((tech: string, tIndex: number) => (
                      <div key={tIndex} className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2 py-1 text-xs">
                        <span>{tech}</span>
                        <button
                          onClick={() => {
                            const newTech = getStringArrayContent(item.content, 'technologies').filter((_: unknown, i: number) => i !== tIndex);
                            updateItemField(index, 'technologies', newTech);
                          }}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{getFieldLabel('projects', 'url', language)}</Label>
                    <Input
                      type="url"
                      placeholder={getFieldPlaceholder('projects', 'url', language)}
                      value={getStringContent(item.content, 'url')}
                      onChange={(e) => updateItemField(index, 'url', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('projects', 'github_url', language)}</Label>
                    <Input
                      type="url"
                      placeholder={getFieldPlaceholder('projects', 'github_url', language)}
                      value={getStringContent(item.content, 'github_url')}
                      onChange={(e) => updateItemField(index, 'github_url', e.target.value)}
                    />
                  </div>
                </div>

                <details className="rounded-lg border border-dashed p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    {text.otherInfo}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {Object.entries(item.content)
                      .filter(([key]) => !standardProjectFields.includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex gap-2 items-center">
                          <Input value={key} disabled className="w-1/3 text-xs bg-muted" />
                          <Input
                            value={String(value)}
                            onChange={(e) => updateItemField(index, key, e.target.value)}
                            className="flex-1 text-xs"
                          />
                          <Button variant="ghost" size="sm" onClick={() => removeCustomField(index, key)} className="h-8 w-8 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    }

                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder={text.customFieldKey}
                        value={getCustomFieldInput(index).key}
                        onChange={(e) => setCustomFieldInputs(prev => ({
                          ...prev,
                          [index]: { ...getCustomFieldInput(index), key: e.target.value }
                        }))}
                        className="w-1/3 text-xs"
                      />
                      <Input
                        placeholder={text.customFieldValue}
                        value={getCustomFieldInput(index).value}
                        onChange={(e) => setCustomFieldInputs(prev => ({
                          ...prev,
                          [index]: { ...getCustomFieldInput(index), value: e.target.value }
                        }))}
                        className="flex-1 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addCustomFieldInline(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              const newItems = [...section.items];
              newItems.push({
                id: `new-${Date.now()}`,
                section_id: section.id,
                content: { name: '', role: '', description: '', technologies: [] }
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addProject}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
