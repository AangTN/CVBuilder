'use client';

import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2, X } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CVSection,
  CVSectionItem,
  SkillLevel,
  SKILL_LEVEL_VALUES,
  getSkillLevelLabel,
  normalizeSkillLevel,
} from '@/lib/types';
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
    addGroupLabel: string;
    addGroupPlaceholder: string;
    addGroupButton: string;
    groupNameLabel: string;
    removeGroupLabel: string;
    addSkillLabel: string;
    addSkillPlaceholder: string;
    emptyText: string;
    emptyGroupText: string;
    nameLabel: string;
    levelLabel: string;
    levelPlaceholder: string;
    defaultGroupName: string;
  }
> = {
  vi: {
    addGroupLabel: 'Tạo nhóm kỹ năng',
    addGroupPlaceholder: 'Ví dụ: Programming',
    addGroupButton: 'Tạo nhóm',
    groupNameLabel: 'Tên nhóm',
    removeGroupLabel: 'Xóa nhóm',
    addSkillLabel: 'Thêm kỹ năng (nhấn Enter)',
    addSkillPlaceholder: 'Ví dụ: Python',
    emptyText: 'Chưa có nhóm kỹ năng nào. Hãy tạo nhóm trước.',
    emptyGroupText: 'Nhóm này chưa có kỹ năng.',
    nameLabel: 'Tên kỹ năng',
    levelLabel: 'Trình độ',
    levelPlaceholder: 'Chọn trình độ',
    defaultGroupName: 'Tổng quát',
  },
  en: {
    addGroupLabel: 'Create skill group',
    addGroupPlaceholder: 'e.g. Programming',
    addGroupButton: 'Create group',
    groupNameLabel: 'Group name',
    removeGroupLabel: 'Remove group',
    addSkillLabel: 'Add skill (press Enter)',
    addSkillPlaceholder: 'e.g. Python',
    emptyText: 'No skill groups yet. Create a group first.',
    emptyGroupText: 'No skills in this group yet.',
    nameLabel: 'Skill name',
    levelLabel: 'Level',
    levelPlaceholder: 'Select level',
    defaultGroupName: 'General',
  },
  ja: {
    addGroupLabel: 'スキルグループを作成',
    addGroupPlaceholder: '例: Programming',
    addGroupButton: 'グループ作成',
    groupNameLabel: 'グループ名',
    removeGroupLabel: 'グループを削除',
    addSkillLabel: 'スキルを追加（Enter）',
    addSkillPlaceholder: '例: Python',
    emptyText: 'スキルグループがありません。先にグループを作成してください。',
    emptyGroupText: 'このグループにはまだスキルがありません。',
    nameLabel: 'スキル名',
    levelLabel: 'レベル',
    levelPlaceholder: 'レベルを選択',
    defaultGroupName: '一般',
  },
  ko: {
    addGroupLabel: '기술 그룹 만들기',
    addGroupPlaceholder: '예: Programming',
    addGroupButton: '그룹 만들기',
    groupNameLabel: '그룹 이름',
    removeGroupLabel: '그룹 삭제',
    addSkillLabel: '기술 추가(Enter)',
    addSkillPlaceholder: '예: Python',
    emptyText: '기술 그룹이 없습니다. 먼저 그룹을 만드세요.',
    emptyGroupText: '이 그룹에는 아직 기술이 없습니다.',
    nameLabel: '기술 이름',
    levelLabel: '수준',
    levelPlaceholder: '수준 선택',
    defaultGroupName: '일반',
  },
  zh: {
    addGroupLabel: '创建技能分组',
    addGroupPlaceholder: '例如：Programming',
    addGroupButton: '创建分组',
    groupNameLabel: '分组名称',
    removeGroupLabel: '删除分组',
    addSkillLabel: '添加技能（按 Enter）',
    addSkillPlaceholder: '例如：Python',
    emptyText: '还没有技能分组，请先创建分组。',
    emptyGroupText: '这个分组里还没有技能。',
    nameLabel: '技能名称',
    levelLabel: '水平',
    levelPlaceholder: '选择水平',
    defaultGroupName: '通用',
  },
};

const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, ' ');

const normalizeGroupName = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return normalizeWhitespace(value);
};

const groupKey = (value: string): string => normalizeWhitespace(value).toLowerCase();

const createItemId = (): string => `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function SkillsSection({ section, language, onUpdate, onToggleVisibility }: SkillsSectionProps) {
  const [newGroupInput, setNewGroupInput] = useState('');
  const [skillInputsByGroup, setSkillInputsByGroup] = useState<Record<string, string>>({});
  const [draftGroups, setDraftGroups] = useState<string[]>([]);
  const [groupNameDrafts, setGroupNameDrafts] = useState<Record<string, string>>({});

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

  const getItemGroupName = (item: CVSectionItem): string => {
    const itemGroupName = normalizeGroupName(item.content.category);
    return itemGroupName || text.defaultGroupName;
  };

  const getItemGroupKey = (item: CVSectionItem): string => {
    return groupKey(getItemGroupName(item));
  };

  const groupedSkills = (() => {
    const groups: Array<{ key: string; name: string; items: CVSectionItem[] }> = [];
    const groupIndexMap = new Map<string, number>();

    section.items.forEach((item) => {
      const name = getItemGroupName(item);
      const key = groupKey(name);
      const existingIndex = groupIndexMap.get(key);

      if (existingIndex === undefined) {
        groupIndexMap.set(key, groups.length);
        groups.push({ key, name, items: [item] });
        return;
      }

      groups[existingIndex].items.push(item);
    });

    draftGroups.forEach((name) => {
      const normalizedName = normalizeGroupName(name);
      if (!normalizedName) {
        return;
      }

      const key = groupKey(normalizedName);
      if (!groupIndexMap.has(key)) {
        groupIndexMap.set(key, groups.length);
        groups.push({ key, name: normalizedName, items: [] });
      }
    });

    return groups;
  })();

  const updateItemField = (itemId: string, field: string, value: unknown) => {
    const newItems = section.items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      const newContent = { ...item.content };
      if (value === undefined || value === '') {
        delete newContent[field];
      } else {
        newContent[field] = value;
      }

      return {
        ...item,
        content: newContent,
      };
    });

    onUpdate(section.id, { items: newItems });
  };

  const removeItem = (itemId: string) => {
    const removedItem = section.items.find((item) => item.id === itemId);
    if (!removedItem) {
      return;
    }

    const removedGroupName = getItemGroupName(removedItem);
    const removedGroupKey = groupKey(removedGroupName);
    const newItems = section.items.filter((item) => item.id !== itemId);
    const stillHasGroupItems = newItems.some((item) => getItemGroupKey(item) === removedGroupKey);

    if (!stillHasGroupItems) {
      setDraftGroups((prev) => {
        if (prev.some((name) => groupKey(name) === removedGroupKey)) {
          return prev;
        }
        return [...prev, removedGroupName];
      });
    }

    onUpdate(section.id, { items: newItems });
  };

  const addGroup = () => {
    const normalizedName = normalizeGroupName(newGroupInput);
    if (!normalizedName) {
      return;
    }

    const newKey = groupKey(normalizedName);
    const alreadyExists = groupedSkills.some((group) => group.key === newKey);
    if (alreadyExists) {
      setNewGroupInput('');
      return;
    }

    setDraftGroups((prev) => [...prev, normalizedName]);
    setSkillInputsByGroup((prev) => ({ ...prev, [newKey]: '' }));
    setNewGroupInput('');
  };

  const removeGroup = (targetGroupKey: string) => {
    const newItems = section.items.filter((item) => getItemGroupKey(item) !== targetGroupKey);
    onUpdate(section.id, { items: newItems });

    setDraftGroups((prev) => prev.filter((name) => groupKey(name) !== targetGroupKey));
    setSkillInputsByGroup((prev) => {
      const next = { ...prev };
      delete next[targetGroupKey];
      return next;
    });
    setGroupNameDrafts((prev) => {
      const next = { ...prev };
      delete next[targetGroupKey];
      return next;
    });
  };

  const addSkillToGroup = (groupName: string, targetGroupKey: string) => {
    const newSkillName = normalizeWhitespace(skillInputsByGroup[targetGroupKey] || '');
    if (!newSkillName) {
      return;
    }

    const newItems = [...section.items, {
      id: createItemId(),
      section_id: section.id,
      content: {
        name: newSkillName,
        category: groupName,
      },
    }];

    onUpdate(section.id, { items: newItems });
    setDraftGroups((prev) => prev.filter((name) => groupKey(name) !== targetGroupKey));
    setSkillInputsByGroup((prev) => ({ ...prev, [targetGroupKey]: '' }));
  };

  const commitGroupRename = (currentGroupKey: string, currentGroupName: string) => {
    const draftName = groupNameDrafts[currentGroupKey];
    if (draftName === undefined) {
      return;
    }

    const normalizedName = normalizeGroupName(draftName);
    if (!normalizedName) {
      setGroupNameDrafts((prev) => ({ ...prev, [currentGroupKey]: currentGroupName }));
      return;
    }

    const nextGroupKey = groupKey(normalizedName);
    const hasConflict = groupedSkills.some(
      (group) => group.key !== currentGroupKey && group.key === nextGroupKey,
    );

    if (hasConflict) {
      setGroupNameDrafts((prev) => ({ ...prev, [currentGroupKey]: currentGroupName }));
      return;
    }

    const hasItemsInCurrentGroup = section.items.some((item) => getItemGroupKey(item) === currentGroupKey);

    if (hasItemsInCurrentGroup) {
      const newItems = section.items.map((item) => {
        if (getItemGroupKey(item) !== currentGroupKey) {
          return item;
        }

        return {
          ...item,
          content: {
            ...item.content,
            category: normalizedName,
          },
        };
      });

      onUpdate(section.id, { items: newItems });
    }

    setDraftGroups((prev) => {
      const renamed = prev
        .map((name) => (groupKey(name) === currentGroupKey ? normalizedName : name))
        .filter((name, index, arr) => arr.findIndex((other) => groupKey(other) === groupKey(name)) === index);

      return renamed;
    });

    setSkillInputsByGroup((prev) => {
      const next = { ...prev };
      const movedInput = next[currentGroupKey];
      delete next[currentGroupKey];

      if (movedInput !== undefined) {
        next[nextGroupKey] = movedInput;
      }

      return next;
    });

    setGroupNameDrafts((prev) => {
      const next = { ...prev };
      delete next[currentGroupKey];
      return next;
    });
  };

  return (
    <AccordionItem value="skills" className="rounded-xl border-2 border-gray-200 bg-white px-1 dark:border-slate-700 dark:bg-card">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger 
          className={`flex-1 px-4 py-4 text-lg font-semibold hover:no-underline ${!section.is_visible ? 'opacity-50' : ''}`}
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
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-4">
          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <Label>{text.addGroupLabel}</Label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                placeholder={text.addGroupPlaceholder}
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGroup();
                  }
                }}
              />
              <Button type="button" onClick={addGroup} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {text.addGroupButton}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {groupedSkills.map((group) => (
              <div key={group.key} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{text.groupNameLabel}</Label>
                    <Input
                      value={groupNameDrafts[group.key] ?? group.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setGroupNameDrafts((prev) => ({ ...prev, [group.key]: value }));
                      }}
                      onBlur={() => commitGroupRename(group.key, group.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitGroupRename(group.key, group.name);
                        }
                      }}
                      placeholder={text.addGroupPlaceholder}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroup(group.key)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={text.removeGroupLabel}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{text.addSkillLabel}</Label>
                  <Input
                    placeholder={text.addSkillPlaceholder}
                    value={skillInputsByGroup[group.key] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSkillInputsByGroup((prev) => ({ ...prev, [group.key]: value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillToGroup(group.name, group.key);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  {group.items.length === 0 && (
                    <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                      {text.emptyGroupText}
                    </div>
                  )}

                  {group.items.map((item) => (
                    <div key={item.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px_auto] sm:items-center">
                      <Input
                        value={getStringContent(item.content, 'name')}
                        onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                        placeholder={text.nameLabel}
                        className="h-9"
                        aria-label={text.nameLabel}
                      />
                      <select
                        value={getSkillLevelContent(item.content)}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateItemField(item.id, 'level', value ? (value as SkillLevel) : undefined);
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={text.levelLabel}
                      >
                        <option value="">{text.levelPlaceholder}</option>
                        {levelOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        aria-label="Remove skill"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {groupedSkills.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-muted-foreground dark:border-slate-600">
              {text.emptyText}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
