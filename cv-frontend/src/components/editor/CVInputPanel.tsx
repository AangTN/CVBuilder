'use client';

import { useMemo, useState } from 'react';
import { CVData, CVSection, SectionType } from '@/lib/types';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EyeOff, Plus, Trash2 } from 'lucide-react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { HeaderSection } from './sections/HeaderSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { CustomSection } from './sections/CustomSection';

interface CVInputPanelProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const STANDARD_SECTION_TYPES: SectionType[] = [
  'header',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

const INPUT_PANEL_TEXTS: Record<Language, {
  addBlock: string;
  deleteBlock: string;
  chooseBlock: string;
  hiddenSection: string;
  noSectionSelected: string;
  noMissingStandardSection: string;
  deleteSectionConfirm: string;
  addCustomSection: string;
  customSectionTitle: string;
}> = {
  vi: {
    addBlock: 'Thêm khối',
    deleteBlock: 'Xóa section',
    chooseBlock: 'Chọn khối muốn thêm',
    hiddenSection: 'Đang ẩn trên preview',
    noSectionSelected: 'Chọn section phía trên để nhập thông tin.',
    noMissingStandardSection: 'Đã có đủ section chuẩn',
    deleteSectionConfirm: 'Bạn có chắc chắn muốn xóa section này?',
    addCustomSection: 'Thêm Section Tùy Chỉnh',
    customSectionTitle: 'Section Tùy Chỉnh',
  },
  en: {
    addBlock: 'Add block',
    deleteBlock: 'Delete section',
    chooseBlock: 'Choose a block to add',
    hiddenSection: 'Hidden in preview',
    noSectionSelected: 'Select a section above to start editing.',
    noMissingStandardSection: 'All standard sections already exist',
    deleteSectionConfirm: 'Are you sure you want to delete this section?',
    addCustomSection: 'Add Custom Section',
    customSectionTitle: 'Custom Section',
  },
  ja: {
    addBlock: 'ブロックを追加',
    deleteBlock: 'セクションを削除',
    chooseBlock: '追加するブロックを選択',
    hiddenSection: 'プレビューでは非表示',
    noSectionSelected: '上部のセクションを選択して編集してください。',
    noMissingStandardSection: '標準セクションはすべて追加済みです',
    deleteSectionConfirm: 'このセクションを削除してもよろしいですか？',
    addCustomSection: 'カスタムセクションを追加',
    customSectionTitle: 'カスタムセクション',
  },
  ko: {
    addBlock: '블록 추가',
    deleteBlock: '섹션 삭제',
    chooseBlock: '추가할 블록 선택',
    hiddenSection: '미리보기에서 숨김',
    noSectionSelected: '위에서 섹션을 선택해 입력하세요.',
    noMissingStandardSection: '표준 섹션이 모두 존재합니다',
    deleteSectionConfirm: '이 섹션을 삭제하시겠습니까?',
    addCustomSection: '사용자 정의 섹션 추가',
    customSectionTitle: '사용자 정의 섹션',
  },
  zh: {
    addBlock: '添加模块',
    deleteBlock: '删除部分',
    chooseBlock: '选择要添加的模块',
    hiddenSection: '在预览中隐藏',
    noSectionSelected: '请先在上方选择要编辑的部分。',
    noMissingStandardSection: '标准模块已全部存在',
    deleteSectionConfirm: '确定要删除这个部分吗？',
    addCustomSection: '添加自定义部分',
    customSectionTitle: '自定义部分',
  },
};

const getAccordionValue = (section: CVSection): string =>
  section.section_type === 'custom' ? `custom-${section.id}` : section.section_type;

const isDeletableSection = (section: CVSection): boolean => section.section_type !== 'header';

const createUniqueId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function CVInputPanel({ data, onChange }: CVInputPanelProps) {
  const language = (data.language as Language) || 'vi';
  const text = INPUT_PANEL_TEXTS[language] || INPUT_PANEL_TEXTS.en;

  const orderedSections = useMemo(() => {
    const standardSections = STANDARD_SECTION_TYPES
      .map((type) => data.sections.find((section) => section.section_type === type))
      .filter((section): section is CVSection => section !== undefined);
    const customSections = data.sections.filter((section) => section.section_type === 'custom');
    return [...standardSections, ...customSections];
  }, [data.sections]);

  const [activeSectionValue, setActiveSectionValue] = useState<string>(() => {
    const headerSection = data.sections.find((section) => section.section_type === 'header');
    if (headerSection) {
      return getAccordionValue(headerSection);
    }

    const firstSection = data.sections[0];
    return firstSection ? getAccordionValue(firstSection) : '';
  });

  const resolvedActiveSectionValue = useMemo(() => {
    if (orderedSections.length === 0) {
      return '';
    }

    const hasActiveSection = orderedSections.some(
      (section) => getAccordionValue(section) === activeSectionValue,
    );
    if (hasActiveSection) {
      return activeSectionValue;
    }

    const headerSection = orderedSections.find((section) => section.section_type === 'header');
    return headerSection ? getAccordionValue(headerSection) : getAccordionValue(orderedSections[0]);
  }, [activeSectionValue, orderedSections]);

  const activeSection = orderedSections.find(
    (section) => getAccordionValue(section) === resolvedActiveSectionValue,
  );

  const missingStandardSectionTypes = STANDARD_SECTION_TYPES.filter(
    (type) => !data.sections.some((section) => section.section_type === type),
  );

  const getSectionLabel = (section: CVSection): string =>
    section.section_type === 'custom' ? section.title : getSectionTitle(section.section_type, language);

  const updateSection = (sectionId: string, updates: Partial<CVSection>) => {
    const newSections = data.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section,
    );
    onChange({ ...data, sections: newSections });
  };

  const toggleSectionVisibility = (sectionId: string, currentVisibility: boolean) => {
    updateSection(sectionId, { is_visible: !currentVisibility });
  };

  const deleteSection = (sectionId: string) => {
    const targetSection = data.sections.find((section) => section.id === sectionId);
    if (!targetSection || !isDeletableSection(targetSection)) {
      return;
    }

    const newSections = data.sections.filter((section) => section.id !== sectionId);
    onChange({ ...data, sections: newSections });

    if (activeSection?.id !== sectionId) {
      return;
    }

    const newOrderedSections = [
      ...STANDARD_SECTION_TYPES
        .map((type) => newSections.find((section) => section.section_type === type))
        .filter((section): section is CVSection => section !== undefined),
      ...newSections.filter((section) => section.section_type === 'custom'),
    ];

    if (newOrderedSections.length === 0) {
      setActiveSectionValue('');
      return;
    }

    const headerSection = newOrderedSections.find((section) => section.section_type === 'header');
    setActiveSectionValue(getAccordionValue(headerSection || newOrderedSections[0]));
  };

  const handleDeleteActiveSection = () => {
    if (!activeSection || !isDeletableSection(activeSection)) {
      return;
    }

    if (!window.confirm(text.deleteSectionConfirm)) {
      return;
    }

    deleteSection(activeSection.id);
  };

  const createDefaultSection = (sectionType: SectionType): CVSection => {
    const sectionId = createUniqueId(sectionType);
    const customSectionCount = data.sections.filter((section) => section.section_type === 'custom').length + 1;

    const baseSection: CVSection = {
      id: sectionId,
      cv_id: data.id || '',
      section_type: sectionType,
      title:
        sectionType === 'custom'
          ? `${text.customSectionTitle} ${customSectionCount}`
          : getSectionTitle(sectionType, language),
      is_visible: true,
      items: [],
    };

    const itemId = createUniqueId(`${sectionType}-item`);

    if (sectionType === 'header') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
            content: {
              full_name: '',
              title: '',
              email: '',
              phone: '',
              location: '',
              date_of_birth: '',
              gender: '',
              website: '',
              linkedin: '',
              github: '',
              facebook: '',
              twitter: '',
              instagram: '',
              photo_url: '',
              summary: '',
            },
          },
        ],
      };
    }

    if (sectionType === 'experience') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
            content: {
              role: '',
              company: '',
              location: '',
              employment_type: '',
              start_date: '',
              end_date: '',
              description: '',
              highlights: [],
            },
          },
        ],
      };
    }

    if (sectionType === 'education') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
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
            },
          },
        ],
      };
    }

    if (sectionType === 'skills') {
      return {
        ...baseSection,
        items: [],
      };
    }

    if (sectionType === 'projects') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
            content: {
              name: '',
              role: '',
              start_date: '',
              end_date: '',
              description: '',
              technologies: [],
              url: '',
              github_url: '',
            },
          },
        ],
      };
    }

    if (sectionType === 'certifications') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
            content: {
              name: '',
              issuer: '',
              issue_date: '',
              expiration_date: '',
              credential_id: '',
              credential_url: '',
              description: '',
            },
          },
        ],
      };
    }

    if (sectionType === 'languages') {
      return {
        ...baseSection,
        items: [
          {
            id: itemId,
            section_id: sectionId,
            content: {
              name: '',
              proficiency: 'Intermediate',
            },
          },
        ],
      };
    }

    return {
      ...baseSection,
      items: [
        {
          id: itemId,
          section_id: sectionId,
          content: {
            label: '',
            value: '',
          },
        },
      ],
    };
  };

  const addSection = (sectionType: SectionType) => {
    if (sectionType !== 'custom' && data.sections.some((section) => section.section_type === sectionType)) {
      return;
    }

    const newSection = createDefaultSection(sectionType);
    const newSections = [...data.sections, newSection];
    onChange({ ...data, sections: newSections });
    setActiveSectionValue(getAccordionValue(newSection));
  };

  const renderSection = (section: CVSection) => {
    if (section.section_type === 'header') {
      return (
        <HeaderSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'experience') {
      return (
        <ExperienceSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'education') {
      return (
        <EducationSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'skills') {
      return (
        <SkillsSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'projects') {
      return (
        <ProjectsSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'certifications') {
      return (
        <CertificationsSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    if (section.section_type === 'languages') {
      return (
        <LanguagesSection
          key={section.id}
          section={section}
          language={language}
          onUpdate={updateSection}
          onToggleVisibility={toggleSectionVisibility}
        />
      );
    }

    return (
      <CustomSection
        key={section.id}
        section={section}
        language={language}
        onUpdate={updateSection}
        onToggleVisibility={toggleSectionVisibility}
        onDelete={deleteSection}
      />
    );
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50 dark:bg-slate-900/30">
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-wrap gap-2 pb-1">
            {orderedSections.map((section) => {
              const accordionValue = getAccordionValue(section);
              const isActive = accordionValue === resolvedActiveSectionValue;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionValue(accordionValue)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{getSectionLabel(section)}</span>
                  {section.is_visible === false && <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {activeSection && isDeletableSection(activeSection) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive/10"
              onClick={handleDeleteActiveSection}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {text.deleteBlock}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" className="shrink-0 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {text.addBlock}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{text.chooseBlock}</DropdownMenuLabel>
              {missingStandardSectionTypes.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {text.noMissingStandardSection}
                </div>
              )}
              {missingStandardSectionTypes.map((sectionType) => (
                <DropdownMenuItem key={sectionType} onClick={() => addSection(sectionType)}>
                  {getSectionTitle(sectionType, language)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => addSection('custom')}>
                {text.addCustomSection}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeSection ? (
          <>
            {activeSection.is_visible === false && (
              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {text.hiddenSection}
              </div>
            )}

            <Accordion type="single" value={resolvedActiveSectionValue} className="space-y-6 pb-12">
              {renderSection(activeSection)}
            </Accordion>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 px-4 py-6 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            {text.noSectionSelected}
          </div>
        )}
      </div>
    </div>
  );
}
