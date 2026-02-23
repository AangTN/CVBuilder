'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface LanguagesSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const standardLanguageFields = ['name', 'proficiency', 'certification'];

const LANGUAGE_SECTION_TEXTS: Record<Language, {
  itemTitle: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addLanguage: string;
}> = {
  vi: {
    itemTitle: 'Ngôn ngữ',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addLanguage: 'Thêm ngoại ngữ',
  },
  en: {
    itemTitle: 'Language',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addLanguage: 'Add language',
  },
  ja: {
    itemTitle: '言語',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addLanguage: '言語を追加',
  },
  ko: {
    itemTitle: '언어',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addLanguage: '언어 추가',
  },
  zh: {
    itemTitle: '语言',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addLanguage: '添加语言',
  },
};

export function LanguagesSection({ section, language, onUpdate, onToggleVisibility }: LanguagesSectionProps) {
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const text = LANGUAGE_SECTION_TEXTS[language] || LANGUAGE_SECTION_TEXTS.en;

  const getStringContent = (content: Record<string, unknown>, key: string): string => {
    const value = content[key];
    return typeof value === 'string' ? value : '';
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
    <AccordionItem value="languages">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`text-lg font-semibold flex-1 ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('languages', language)} ({section.items.length})
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
                    <Label>{getFieldLabel('languages', 'name', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('languages', 'name', language)}
                      value={getStringContent(item.content, 'name')}
                      onChange={(e) => updateItemField(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('languages', 'proficiency', language)} *</Label>
                    <SimpleSelect
                      value={getStringContent(item.content, 'proficiency') || 'Intermediate'}
                      onChange={(e) => updateItemField(index, 'proficiency', e.target.value)}
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                    </SimpleSelect>
                  </div>
                </div>

                <div>
                  <Label>{getFieldLabel('languages', 'certification', language)}</Label>
                  <Input
                    placeholder={getFieldPlaceholder('languages', 'certification', language)}
                    value={getStringContent(item.content, 'certification')}
                    onChange={(e) => updateItemField(index, 'certification', e.target.value)}
                  />
                </div>

                <details className="rounded-lg border border-dashed p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    {text.otherInfo}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {Object.entries(item.content)
                      .filter(([key]) => !standardLanguageFields.includes(key))
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
                content: { name: '', proficiency: 'Intermediate', certification: '' }
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addLanguage}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
