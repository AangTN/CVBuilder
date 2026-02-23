'use client';

import { useState } from 'react';
import { CVData, CVSection } from '@/lib/types';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { HeaderSection } from './sections/HeaderSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { CustomSection } from './sections/CustomSection';

interface CVInputPanelProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const INPUT_PANEL_TEXTS: Record<Language, {
  addCustomSection: string;
  customSectionTitle: string;
}> = {
  vi: {
    addCustomSection: 'Thêm Section Tùy Chỉnh',
    customSectionTitle: 'Section Tùy Chỉnh',
  },
  en: {
    addCustomSection: 'Add Custom Section',
    customSectionTitle: 'Custom Section',
  },
  ja: {
    addCustomSection: 'カスタムセクションを追加',
    customSectionTitle: 'カスタムセクション',
  },
  ko: {
    addCustomSection: '사용자 정의 섹션 추가',
    customSectionTitle: '사용자 정의 섹션',
  },
  zh: {
    addCustomSection: '添加自定义部分',
    customSectionTitle: '自定义部分',
  },
};

export function CVInputPanel({ data, onChange }: CVInputPanelProps) {
  const language = (data.language as Language) || 'vi';
  const text = INPUT_PANEL_TEXTS[language] || INPUT_PANEL_TEXTS.en;
  const headerSection = data.sections.find(s => s.section_type === 'header');
  const experienceSection = data.sections.find(s => s.section_type === 'experience');
  const educationSection = data.sections.find(s => s.section_type === 'education');
  const skillsSection = data.sections.find(s => s.section_type === 'skills');
  const projectsSection = data.sections.find(s => s.section_type === 'projects');
  const languagesSection = data.sections.find(s => s.section_type === 'languages');
  const customSections = data.sections.filter(s => s.section_type === 'custom');
  const [openSections, setOpenSections] = useState<string[]>(['header']);

  const quickSectionItems = [
    headerSection
      ? {
          id: `input-section-${headerSection.id}`,
          label: getSectionTitle('header', language),
          accordionValue: 'header',
        }
      : null,
    experienceSection
      ? {
          id: `input-section-${experienceSection.id}`,
          label: getSectionTitle('experience', language),
          accordionValue: 'experience',
        }
      : null,
    educationSection
      ? {
          id: `input-section-${educationSection.id}`,
          label: getSectionTitle('education', language),
          accordionValue: 'education',
        }
      : null,
    skillsSection
      ? {
          id: `input-section-${skillsSection.id}`,
          label: getSectionTitle('skills', language),
          accordionValue: 'skills',
        }
      : null,
    projectsSection
      ? {
          id: `input-section-${projectsSection.id}`,
          label: getSectionTitle('projects', language),
          accordionValue: 'projects',
        }
      : null,
    languagesSection
      ? {
          id: `input-section-${languagesSection.id}`,
          label: getSectionTitle('languages', language),
          accordionValue: 'languages',
        }
      : null,
    ...customSections.map((section) => ({
      id: `input-section-${section.id}`,
      label: section.title,
      accordionValue: `custom-${section.id}`,
    })),
  ].filter((item): item is { id: string; label: string; accordionValue: string } => item !== null);

  const updateSection = (sectionId: string, updates: Partial<CVSection>) => {
    const newSections = data.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    );
    onChange({ ...data, sections: newSections });
  };

  const toggleSectionVisibility = (sectionId: string, currentVisibility: boolean) => {
    updateSection(sectionId, { is_visible: !currentVisibility });
  };

  const deleteSection = (sectionId: string) => {
    const newSections = data.sections.filter(s => s.id !== sectionId);
    onChange({ ...data, sections: newSections });
  };

  const addCustomSection = () => {
    const sectionId = `custom-${Date.now()}`;
    const newSection: CVSection = {
      id: sectionId,
      cv_id: data.id || '',
      section_type: 'custom',
      title: text.customSectionTitle,
      is_visible: true,
      items: []
    };
    onChange({ ...data, sections: [...data.sections, newSection] });
    const accordionValue = `custom-${sectionId}`;
    setOpenSections((prev) => (prev.includes(accordionValue) ? prev : [...prev, accordionValue]));
    setTimeout(() => {
      document.getElementById(`input-section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const expandAll = () => {
    setOpenSections(quickSectionItems.map((item) => item.accordionValue));
  };

  const collapseAll = () => {
    setOpenSections([]);
  };

  const scrollToSection = (sectionDomId: string, accordionValue: string) => {
    setOpenSections((prev) => (prev.includes(accordionValue) ? prev : [...prev, accordionValue]));
    setTimeout(() => {
      document.getElementById(sectionDomId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50 dark:bg-slate-900/30">
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <>
        {/* Quick Nav */}
        <div className="mb-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md py-2 -mx-4 px-4 border-b border-gray-100 flex items-center justify-between dark:bg-slate-900/80 dark:border-slate-800">
           <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
            {quickSectionItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    openSections.includes(item.accordionValue) 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
                onClick={() => scrollToSection(item.id, item.accordionValue)}
              >
                {item.label}
              </button>
            ))}
          </div>
           <div className="flex items-center gap-1 pl-2 border-l border-gray-200 ml-2 dark:border-slate-700">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100" onClick={expandAll} title="Mở tất cả">
                  <span className="sr-only">Expand</span>
                  <Plus className="h-4 w-4" />
              </Button>
               <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100" onClick={collapseAll} title="Thu gọn">
                 <span className="sr-only">Collapse</span>
                 <Minus className="h-4 w-4" />
              </Button>
           </div>
        </div>

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(value) => setOpenSections(Array.isArray(value) ? value : value ? [value] : [])}
          className="space-y-6 pb-20"
        >
          {headerSection && (
            <div id={`input-section-${headerSection.id}`} className="scroll-mt-24">
              <HeaderSection 
                section={headerSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {experienceSection && (
            <div id={`input-section-${experienceSection.id}`} className="scroll-mt-24">
              <ExperienceSection 
                section={experienceSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {educationSection && (
            <div id={`input-section-${educationSection.id}`} className="scroll-mt-24">
              <EducationSection 
                section={educationSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {skillsSection && (
            <div id={`input-section-${skillsSection.id}`} className="scroll-mt-24">
              <SkillsSection 
                section={skillsSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {projectsSection && (
            <div id={`input-section-${projectsSection.id}`} className="scroll-mt-24">
               <ProjectsSection 
                section={projectsSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {languagesSection && (
            <div id={`input-section-${languagesSection.id}`} className="scroll-mt-24"> 
              <LanguagesSection 
                section={languagesSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
              />
            </div>
          )}

          {customSections.map((customSection) => (
            <div key={customSection.id} id={`input-section-${customSection.id}`} className="scroll-mt-24">
              <CustomSection
                section={customSection}
                language={language}
                onUpdate={updateSection}
                onToggleVisibility={toggleSectionVisibility}
                onDelete={deleteSection}
              />
            </div>
          ))}

            {/* Add Custom Button moved as a card at the end */}
             <button
                onClick={addCustomSection}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all group dark:border-slate-700 dark:text-slate-500 dark:hover:border-blue-700 dark:hover:text-blue-400 dark:hover:bg-blue-950/20"
            >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors dark:bg-slate-800 dark:group-hover:bg-blue-900/40">
                    <Plus className="h-5 w-5" />
                </div>
                <span className="font-medium">{text.addCustomSection}</span>
            </button>
        </Accordion>
        </>
      </div>
    </div>
  );
}
