'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Eye, EyeOff, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Language } from '@/lib/sectionTitles';

interface CustomSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
  onDelete: (sectionId: string) => void;
}

const standardCustomFields = ['label', 'value'];

const CUSTOM_TEXTS: Record<Language, {
  itemTitle: string;
  labelField: string;
  valueField: string;
  labelPlaceholder: string;
  valuePlaceholder: string;
  otherInfo: string;
  customFieldKey: string;
  customFieldValue: string;
  addItem: string;
}> = {
  vi: {
    itemTitle: 'Mục',
    labelField: 'Nhãn',
    valueField: 'Nội dung',
    labelPlaceholder: 'Ví dụ: Giải thưởng',
    valuePlaceholder: 'Nhập nội dung...',
    otherInfo: 'Thông tin khác',
    customFieldKey: 'Tên...',
    customFieldValue: 'Giá trị...',
    addItem: 'Thêm mục',
  },
  en: {
    itemTitle: 'Item',
    labelField: 'Label',
    valueField: 'Content',
    labelPlaceholder: 'Example: Awards',
    valuePlaceholder: 'Enter content...',
    otherInfo: 'Other information',
    customFieldKey: 'Label...',
    customFieldValue: 'Value...',
    addItem: 'Add item',
  },
  ja: {
    itemTitle: '項目',
    labelField: 'ラベル',
    valueField: '内容',
    labelPlaceholder: '例: 受賞歴',
    valuePlaceholder: '内容を入力...',
    otherInfo: 'その他の情報',
    customFieldKey: '項目名...',
    customFieldValue: '値...',
    addItem: '項目を追加',
  },
  ko: {
    itemTitle: '항목',
    labelField: '라벨',
    valueField: '내용',
    labelPlaceholder: '예: 수상 경력',
    valuePlaceholder: '내용 입력...',
    otherInfo: '기타 정보',
    customFieldKey: '이름...',
    customFieldValue: '값...',
    addItem: '항목 추가',
  },
  zh: {
    itemTitle: '项目',
    labelField: '标签',
    valueField: '内容',
    labelPlaceholder: '例如：奖项',
    valuePlaceholder: '输入内容...',
    otherInfo: '其他信息',
    customFieldKey: '名称...',
    customFieldValue: '值...',
    addItem: '添加项目',
  },
};

export function CustomSection({ section, language, onUpdate, onToggleVisibility, onDelete }: CustomSectionProps) {
  const text = CUSTOM_TEXTS[language] || CUSTOM_TEXTS.en;
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<number, { key: string; value: string }>>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(section.title);

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
    <AccordionItem value={`custom-${section.id}`}>
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`text-lg font-semibold flex-1 ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          <span>{section.title} ({section.items.length})</span>
        </AccordionTrigger>
        <div className="flex items-center gap-1">
          {isEditingTitle && (
            <div className="flex items-center gap-1 mr-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdate(section.id, { title: titleInput });
                    setIsEditingTitle(false);
                  }
                  if (e.key === 'Escape') {
                    setTitleInput(section.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="h-8 w-44"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(section.id, { title: titleInput });
                  setIsEditingTitle(false);
                }}
                className="h-8 w-8 p-0"
                title="Lưu tên section"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          )}
          {!isEditingTitle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="h-8 w-8 p-0"
              title="Sửa tên section"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(section.id, section.is_visible ?? true);
            }}
            className="h-8 w-8 p-0"
            title={section.is_visible !== false ? "Ẩn section" : "Hiện section"}
          >
            {section.is_visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Bạn có chắc chắn muốn xóa section này?')) {
                onDelete(section.id);
              }
            }}
            className="h-8 w-8 p-0 text-destructive"
            title="Xóa section"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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

                <div>
                  <Label>{text.labelField} *</Label>
                  <Input
                    placeholder={text.labelPlaceholder}
                    value={typeof item.content.label === 'string' ? item.content.label : ''}
                    onChange={(e) => updateItemField(index, 'label', e.target.value)}
                  />
                </div>

                <div>
                  <Label>{text.valueField} *</Label>
                  <Textarea
                    placeholder={text.valuePlaceholder}
                    rows={3}
                    value={typeof item.content.value === 'string' ? item.content.value : ''}
                    onChange={(e) => updateItemField(index, 'value', e.target.value)}
                  />
                </div>

                <details className="rounded-lg border border-dashed p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    {text.otherInfo}
                  </summary>

                  <div className="mt-3 space-y-2">
                    {Object.entries(item.content)
                      .filter(([key]) => !standardCustomFields.includes(key))
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
                content: { label: '', value: '' }
              });
              onUpdate(section.id, { items: newItems });
            }}
          >
            <Plus className="h-4 w-4" />
            {text.addItem}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
