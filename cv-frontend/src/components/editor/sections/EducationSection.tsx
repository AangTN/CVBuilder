'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MonthYearInput } from '@/components/editor/inputs/MonthYearInput';
import { Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface EducationSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const standardEducationFields = ['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'gpa', 'description', 'achievements'];

const EDUCATION_TEXTS: Record<Language, {
  itemTitle: string;
  achievementsPlaceholder: string;
  addAchievement: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addEducation: string;
}> = {
  vi: {
    itemTitle: 'Học vấn',
    achievementsPlaceholder: 'Học bổng, giải thưởng...',
    addAchievement: 'Thêm thành tích',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addEducation: 'Thêm học vấn',
  },
  en: {
    itemTitle: 'Education',
    achievementsPlaceholder: 'Scholarship, award...',
    addAchievement: 'Add achievement',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addEducation: 'Add education',
  },
  ja: {
    itemTitle: '学歴',
    achievementsPlaceholder: '奨学金、表彰...',
    addAchievement: '実績を追加',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addEducation: '学歴を追加',
  },
  ko: {
    itemTitle: '학력',
    achievementsPlaceholder: '장학금, 수상...',
    addAchievement: '성과 추가',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addEducation: '학력 추가',
  },
  zh: {
    itemTitle: '教育背景',
    achievementsPlaceholder: '奖学金、奖项...',
    addAchievement: '添加成就',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addEducation: '添加教育经历',
  },
};

export function EducationSection({ section, language, onUpdate, onToggleVisibility }: EducationSectionProps) {
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const text = EDUCATION_TEXTS[language] || EDUCATION_TEXTS.en;

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
    <AccordionItem value="education" className="rounded-xl border-2 border-gray-200 bg-white px-1 dark:border-slate-700 dark:bg-card">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`flex-1 px-4 py-4 text-lg font-semibold hover:no-underline ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('education', language)} ({section.items.length})
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

                <div>
                  <Label>{getFieldLabel('education', 'institution', language)} *</Label>
                  <Input
                    placeholder={getFieldPlaceholder('education', 'institution', language)}
                    value={getStringContent(item.content, 'institution')}
                    onChange={(e) => updateItemField(index, 'institution', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('education', 'degree', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('education', 'degree', language)}
                      value={getStringContent(item.content, 'degree')}
                      onChange={(e) => updateItemField(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('education', 'field_of_study', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('education', 'field_of_study', language)}
                      value={getStringContent(item.content, 'field_of_study')}
                      onChange={(e) => updateItemField(index, 'field_of_study', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>{getFieldLabel('education', 'location', language)}</Label>
                  <Input
                    placeholder={getFieldPlaceholder('education', 'location', language)}
                    value={getStringContent(item.content, 'location')}
                    onChange={(e) => updateItemField(index, 'location', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('education', 'start_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'start_date')}
                      onChange={(value) => updateItemField(index, 'start_date', value)}
                      placeholder={getFieldPlaceholder('education', 'start_date', language)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('education', 'end_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'end_date')}
                      onChange={(value) => updateItemField(index, 'end_date', value)}
                      disabled={getBooleanContent(item.content, 'is_current')}
                      placeholder={getFieldPlaceholder('education', 'end_date', language)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={getBooleanContent(item.content, 'is_current')}
                    onCheckedChange={(checked) => updateItemField(index, 'is_current', checked)}
                  />
                  <Label className="cursor-pointer">{getFieldLabel('education', 'is_current', language)}</Label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('education', 'gpa', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('education', 'gpa', language)}
                      value={getStringContent(item.content, 'gpa')}
                      onChange={(e) => updateItemField(index, 'gpa', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>{getFieldLabel('education', 'description', language)}</Label>
                  <Textarea
                    placeholder={getFieldPlaceholder('education', 'description', language)}
                    rows={2}
                    value={getStringContent(item.content, 'description')}
                    onChange={(e) => updateItemField(index, 'description', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>{getFieldLabel('education', 'achievements', language)}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAchievements = [...getStringArrayContent(item.content, 'achievements'), ''];
                        updateItemField(index, 'achievements', newAchievements);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {text.addAchievement}
                    </Button>
                  </div>
                  {getStringArrayContent(item.content, 'achievements').map((achievement: string, aIndex: number) => (
                    <div key={aIndex} className="flex gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) => {
                          const newAchievements = [...getStringArrayContent(item.content, 'achievements')];
                          newAchievements[aIndex] = e.target.value;
                          updateItemField(index, 'achievements', newAchievements);
                        }}
                        placeholder={text.achievementsPlaceholder}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newAchievements = getStringArrayContent(item.content, 'achievements').filter((_: unknown, i: number) => i !== aIndex);
                          updateItemField(index, 'achievements', newAchievements);
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
                      .filter(([key]) => !standardEducationFields.includes(key))
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
                  institution: '',
                  degree: '',
                  field_of_study: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  gpa: '',
                  description: '',
                  achievements: [],
                }
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addEducation}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
