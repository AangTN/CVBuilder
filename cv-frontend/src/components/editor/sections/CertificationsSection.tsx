'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MonthYearInput } from '@/components/editor/inputs/MonthYearInput';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface CertificationsSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const STANDARD_CERTIFICATION_FIELDS = [
  'name',
  'issuer',
  'issue_date',
  'expiration_date',
  'credential_id',
  'credential_url',
  'description',
];

const CERTIFICATION_TEXTS: Record<Language, {
  itemTitle: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addCertification: string;
}> = {
  vi: {
    itemTitle: 'Chứng chỉ',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addCertification: 'Thêm chứng chỉ',
  },
  en: {
    itemTitle: 'Certification',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addCertification: 'Add certification',
  },
  ja: {
    itemTitle: '資格・認定',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addCertification: '資格を追加',
  },
  ko: {
    itemTitle: '자격증',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addCertification: '자격증 추가',
  },
  zh: {
    itemTitle: '证书',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addCertification: '添加证书',
  },
};

export function CertificationsSection({
  section,
  language,
  onUpdate,
  onToggleVisibility,
}: CertificationsSectionProps) {
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const text = CERTIFICATION_TEXTS[language] || CERTIFICATION_TEXTS.en;

  const getStringContent = (content: Record<string, unknown>, key: string): string => {
    const value = content[key];
    return typeof value === 'string' ? value : '';
  };

  const updateItemField = (itemIndex: number, field: string, value: unknown) => {
    const newItems = [...section.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      content: { ...newItems[itemIndex].content, [field]: value },
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
      setCustomFieldInputs((prev) => ({ ...prev, [itemIndex]: { key: '', value: '' } }));
    }
  };

  const getCustomFieldInput = (itemIndex: number) => {
    return customFieldInputs[itemIndex] || { key: '', value: '' };
  };

  return (
    <AccordionItem
      value="certifications"
      className="rounded-xl border-2 border-gray-200 bg-white px-1 dark:border-slate-700 dark:bg-card"
    >
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger
          className={`flex-1 px-4 py-4 text-lg font-semibold hover:no-underline ${
            !section.is_visible ? 'opacity-50' : ''
          }`}
        >
          {getSectionTitle('certifications', language)} ({section.items.length})
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
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">{text.itemTitle} #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => {
                      const newItems = section.items.filter((sectionItem) => sectionItem.id !== item.id);
                      onUpdate(section.id, { items: newItems });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('certifications', 'name', language)} *</Label>
                    <Input
                      placeholder={getFieldPlaceholder('certifications', 'name', language)}
                      value={getStringContent(item.content, 'name')}
                      onChange={(e) => updateItemField(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('certifications', 'issuer', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('certifications', 'issuer', language)}
                      value={getStringContent(item.content, 'issuer')}
                      onChange={(e) => updateItemField(index, 'issuer', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('certifications', 'issue_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'issue_date')}
                      onChange={(value) => updateItemField(index, 'issue_date', value)}
                      placeholder={getFieldPlaceholder('certifications', 'issue_date', language)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('certifications', 'expiration_date', language)}</Label>
                    <MonthYearInput
                      language={language}
                      value={getStringContent(item.content, 'expiration_date')}
                      onChange={(value) => updateItemField(index, 'expiration_date', value)}
                      placeholder={getFieldPlaceholder('certifications', 'expiration_date', language)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label>{getFieldLabel('certifications', 'credential_id', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('certifications', 'credential_id', language)}
                      value={getStringContent(item.content, 'credential_id')}
                      onChange={(e) => updateItemField(index, 'credential_id', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{getFieldLabel('certifications', 'credential_url', language)}</Label>
                    <Input
                      placeholder={getFieldPlaceholder('certifications', 'credential_url', language)}
                      value={getStringContent(item.content, 'credential_url')}
                      onChange={(e) => updateItemField(index, 'credential_url', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>{getFieldLabel('certifications', 'description', language)}</Label>
                  <Textarea
                    rows={3}
                    placeholder={getFieldPlaceholder('certifications', 'description', language)}
                    value={getStringContent(item.content, 'description')}
                    onChange={(e) => updateItemField(index, 'description', e.target.value)}
                  />
                </div>

                <details className="rounded-lg border border-dashed p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    {text.otherInfo}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {Object.entries(item.content)
                      .filter(([key]) => !STANDARD_CERTIFICATION_FIELDS.includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Input value={key} disabled className="w-1/3 text-xs bg-muted" />
                          <Input
                            value={String(value)}
                            onChange={(e) => updateItemField(index, key, e.target.value)}
                            className="flex-1 text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomField(index, key)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={text.customFieldKey}
                        value={getCustomFieldInput(index).key}
                        onChange={(e) =>
                          setCustomFieldInputs((prev) => ({
                            ...prev,
                            [index]: { ...getCustomFieldInput(index), key: e.target.value },
                          }))
                        }
                        className="w-1/3 text-xs"
                      />
                      <Input
                        placeholder={text.customFieldValue}
                        value={getCustomFieldInput(index).value}
                        onChange={(e) =>
                          setCustomFieldInputs((prev) => ({
                            ...prev,
                            [index]: { ...getCustomFieldInput(index), value: e.target.value },
                          }))
                        }
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
                  name: '',
                  issuer: '',
                  issue_date: '',
                  expiration_date: '',
                  credential_id: '',
                  credential_url: '',
                  description: '',
                },
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addCertification}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
