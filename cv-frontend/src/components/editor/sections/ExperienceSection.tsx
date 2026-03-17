'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SimpleSelect } from '@/components/ui/select';
import { MonthYearInput } from '@/components/editor/inputs/MonthYearInput';
import { Plus, GripVertical, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface ExperienceSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const standardExperienceFields = ['company', 'role', 'location', 'employment_type', 'start_date', 'end_date', 'is_current', 'description', 'highlights'];

const EXPERIENCE_TEXTS: Record<Language, {
  itemTitle: string;
  highlightsPlaceholder: string;
  addHighlight: string;
  employmentTypePlaceholder: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addExperience: string;
}> = {
  vi: {
    itemTitle: 'Kinh nghiệm',
    highlightsPlaceholder: 'Thành tích...',
    addHighlight: 'Thêm điểm nổi bật',
    employmentTypePlaceholder: 'Chọn hình thức làm việc',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addExperience: 'Thêm kinh nghiệm',
  },
  en: {
    itemTitle: 'Experience',
    highlightsPlaceholder: 'Achievement...',
    addHighlight: 'Add highlight',
    employmentTypePlaceholder: 'Select employment type',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addExperience: 'Add experience',
  },
  ja: {
    itemTitle: '職務経歴',
    highlightsPlaceholder: '実績...',
    addHighlight: '実績を追加',
    employmentTypePlaceholder: '雇用形態を選択',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addExperience: '職務経歴を追加',
  },
  ko: {
    itemTitle: '경력',
    highlightsPlaceholder: '성과...',
    addHighlight: '성과 추가',
    employmentTypePlaceholder: '고용 형태 선택',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addExperience: '경력 추가',
  },
  zh: {
    itemTitle: '工作经历',
    highlightsPlaceholder: '成就...',
    addHighlight: '添加亮点',
    employmentTypePlaceholder: '选择工作类型',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addExperience: '添加经历',
  },
};

const EMPLOYMENT_TYPE_OPTIONS: Record<Language, { value: string; label: string }[]> = {
  vi: [
    { value: 'full_time', label: 'Toàn thời gian' },
    { value: 'part_time', label: 'Bán thời gian' },
    { value: 'contract', label: 'Hợp đồng' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'freelance', label: 'Freelance' },
  ],
  en: [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ],
  ja: [
    { value: 'full_time', label: '正社員' },
    { value: 'part_time', label: 'パートタイム' },
    { value: 'contract', label: '契約社員' },
    { value: 'internship', label: 'インターン' },
    { value: 'freelance', label: 'フリーランス' },
  ],
  ko: [
    { value: 'full_time', label: '정규직' },
    { value: 'part_time', label: '파트타임' },
    { value: 'contract', label: '계약직' },
    { value: 'internship', label: '인턴십' },
    { value: 'freelance', label: '프리랜서' },
  ],
  zh: [
    { value: 'full_time', label: '全职' },
    { value: 'part_time', label: '兼职' },
    { value: 'contract', label: '合同制' },
    { value: 'internship', label: '实习' },
    { value: 'freelance', label: '自由职业' },
  ],
};

export function ExperienceSection({ section, language, onUpdate, onToggleVisibility }: ExperienceSectionProps) {
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const text = EXPERIENCE_TEXTS[language] || EXPERIENCE_TEXTS.en;
  const employmentTypeOptions = EMPLOYMENT_TYPE_OPTIONS[language] || EMPLOYMENT_TYPE_OPTIONS.en;

  const getStringContent = (content: Record<string, unknown>, key: string): string => {
    const value = content[key];
    return typeof value === 'string' ? value : '';
  };

  const getBooleanContent = (content: Record<string, unknown>, key: string): boolean => {
    return content[key] === true;
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
    <AccordionItem value="experience" className="rounded-xl border-2 border-gray-200 bg-white px-1 dark:border-slate-700 dark:bg-card">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`flex-1 px-4 py-4 text-lg font-semibold hover:no-underline ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('experience', language)} ({section.items.length})
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
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-4">
          {section.items.map((item, index) => (
            <div key={item.id} className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <div className="absolute left-2 top-2 cursor-move text-gray-400">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="space-y-3 pl-6">
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

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('experience', 'role', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('experience', 'role', language)}
                      value={getStringContent(item.content, 'role')}
                      onChange={(e) => updateItemField(index, 'role', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('experience', 'company', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('experience', 'company', language)}
                      value={getStringContent(item.content, 'company')}
                      onChange={(e) => updateItemField(index, 'company', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('experience', 'location', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('experience', 'location', language)}
                      value={getStringContent(item.content, 'location')}
                      onChange={(e) => updateItemField(index, 'location', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>{getFieldLabel('experience', 'employment_type', language)}</Label>
                    <SimpleSelect
                      value={getStringContent(item.content, 'employment_type')}
                      onChange={(e) => updateItemField(index, 'employment_type', e.target.value)}
                      className="h-9"
                    >
                      <option value="">{text.employmentTypePlaceholder}</option>
                      {employmentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SimpleSelect>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('experience', 'start_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'start_date')}
                      onChange={(value) => updateItemField(index, 'start_date', value)}
                      placeholder={getFieldPlaceholder('experience', 'start_date', language)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('experience', 'end_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'end_date')}
                      onChange={(value) => updateItemField(index, 'end_date', value)}
                      disabled={getBooleanContent(item.content, 'is_current')}
                      placeholder={getFieldPlaceholder('experience', 'end_date', language)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={getBooleanContent(item.content, 'is_current')}
                    onCheckedChange={(checked) => updateItemField(index, 'is_current', checked)}
                  />
                  <Label className="cursor-pointer">{getFieldLabel('experience', 'is_current', language)}</Label>
                </div>

                <div>
                  <Label>{getFieldLabel('experience', 'description', language)}</Label>
                  <Textarea
                    placeholder={getFieldPlaceholder('experience', 'description', language)}
                    rows={3}
                    value={getStringContent(item.content, 'description').replace(/<[^>]*>/g, '')}
                    onChange={(e) => updateItemField(index, 'description', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>{getFieldLabel('experience', 'highlights', language)}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newHighlights = [...getStringArrayContent(item.content, 'highlights'), ''];
                        updateItemField(index, 'highlights', newHighlights);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {text.addHighlight}
                    </Button>
                  </div>
                  {getStringArrayContent(item.content, 'highlights').map((highlight: string, hIndex: number) => (
                    <div key={hIndex} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => {
                          const newHighlights = [...getStringArrayContent(item.content, 'highlights')];
                          newHighlights[hIndex] = e.target.value;
                          updateItemField(index, 'highlights', newHighlights);
                        }}
                        placeholder={text.highlightsPlaceholder}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newHighlights = getStringArrayContent(item.content, 'highlights').filter((_: unknown, i: number) => i !== hIndex);
                          updateItemField(index, 'highlights', newHighlights);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <details className="rounded-lg border border-dashed p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    {text.otherInfo}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {Object.entries(item.content)
                      .filter(([key]) => !standardExperienceFields.includes(key))
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
                content: {
                  role: '',
                  company: '',
                  location: '',
                  employment_type: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  highlights: [],
                }
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addExperience}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
