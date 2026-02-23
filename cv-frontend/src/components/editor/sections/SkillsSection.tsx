'use client';

import { CVSection, SkillLevel, SKILL_LEVEL_VALUES, getSkillLevelLabel, normalizeSkillLevel } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';

interface SkillsSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const SKILL_TEXTS: Record<
  Language,
  {
    addLabel: string;
    addPlaceholder: string;
    emptyText: string;
    nameLabel: string;
    groupLabel: string;
    groupPlaceholder: string;
    levelLabel: string;
  }
> = {
  vi: {
    addLabel: 'Thêm kỹ năng (nhấn Enter)',
    addPlaceholder: 'JavaScript, React, Node.js...',
    emptyText: 'Chưa có kỹ năng nào. Nhập và nhấn Enter để thêm.',
    nameLabel: 'Tên kỹ năng',
    groupLabel: 'Nhóm',
    groupPlaceholder: 'Ví dụ: Frontend, Design...',
    levelLabel: 'Trình độ',
  },
  en: {
    addLabel: 'Add skill (press Enter)',
    addPlaceholder: 'JavaScript, React, Node.js...',
    emptyText: 'No skills yet. Type and press Enter to add.',
    nameLabel: 'Skill name',
    groupLabel: 'Group',
    groupPlaceholder: 'e.g. Frontend, Design...',
    levelLabel: 'Level',
  },
  ja: {
    addLabel: 'スキルを追加（Enterで追加）',
    addPlaceholder: 'JavaScript, React, Node.js...',
    emptyText: 'スキルがまだありません。入力してEnterで追加してください。',
    nameLabel: 'スキル名',
    groupLabel: 'グループ',
    groupPlaceholder: '例: フロントエンド、デザイン...',
    levelLabel: 'レベル',
  },
  ko: {
    addLabel: '기술 추가(Enter)',
    addPlaceholder: 'JavaScript, React, Node.js...',
    emptyText: '아직 기술이 없습니다. 입력 후 Enter를 누르세요.',
    nameLabel: '기술 이름',
    groupLabel: '그룹',
    groupPlaceholder: '예: 프론트엔드, 디자인...',
    levelLabel: '수준',
  },
  zh: {
    addLabel: '添加技能（按 Enter）',
    addPlaceholder: 'JavaScript, React, Node.js...',
    emptyText: '暂无技能。输入后按 Enter 添加。',
    nameLabel: '技能名称',
    groupLabel: '分组',
    groupPlaceholder: '例如：前端、设计...',
    levelLabel: '水平',
  },
};

export function SkillsSection({ section, language, onUpdate, onToggleVisibility }: SkillsSectionProps) {
  const [skillInput, setSkillInput] = useState('');
  const text = SKILL_TEXTS[language] || SKILL_TEXTS.en;
  const levelOptions = SKILL_LEVEL_VALUES.map((value) => ({
    value,
    label: getSkillLevelLabel(value, language),
  }));

  const getStringContent = (content: Record<string, unknown>, key: string): string => {
    const value = content[key];
    return typeof value === 'string' ? value : '';
  };

  const getSkillLevelContent = (content: Record<string, unknown>): SkillLevel | '' => {
    return normalizeSkillLevel(content.level) || '';
  };

  const updateItemField = (itemIndex: number, field: string, value: unknown) => {
    const newItems = [...section.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      content: { ...newItems[itemIndex].content, [field]: value }
    };
    onUpdate(section.id, { items: newItems });
  };

  return (
    <AccordionItem value="skills">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`text-lg font-semibold flex-1 ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('skills', language)} ({section.items.length})
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
          <div>
            <Label>{text.addLabel}</Label>
            <Input
              placeholder={text.addPlaceholder}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  e.preventDefault();
                  const newItems = [...section.items];
                  newItems.push({
                    id: `new-${Date.now()}`,
                    section_id: section.id,
                    content: { name: skillInput.trim(), category: '' }
                  });
                  onUpdate(section.id, { items: newItems });
                  setSkillInput('');
                }
              }}
            />
          </div>

          <div className="space-y-3">
            {section.items.map((item, index) => (
              <div 
                key={item.id} 
                className="relative rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_160px] sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{text.nameLabel}</Label>
                    <Input
                      value={getStringContent(item.content, 'name')}
                      onChange={(e) => updateItemField(index, 'name', e.target.value)}
                      placeholder={text.addPlaceholder}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{text.groupLabel}</Label>
                    <Input
                      value={getStringContent(item.content, 'category')}
                      onChange={(e) => updateItemField(index, 'category', e.target.value)}
                      placeholder={text.groupPlaceholder}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{text.levelLabel}</Label>
                    <select
                      value={getSkillLevelContent(item.content)}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateItemField(index, 'level', value ? (value as SkillLevel) : undefined);
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">{text.levelLabel}</option>
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    const newItems = section.items.filter(i => i.id !== item.id);
                    onUpdate(section.id, { items: newItems });
                  }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove skill"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {section.items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              {text.emptyText}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
