'use client';

import React from 'react';
import Image from 'next/image';
import {
  CVData,
  CVSectionItem,
  HeaderContent,
  ExperienceContent,
  EducationContent,
  SkillContent,
  ProjectContent,
  LanguageContent,
  CustomContent,
  normalizeSkillLevel,
  getSkillLevelLabel,
} from '@/lib/types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Sparkles } from 'lucide-react';
import { A4PageWrapper } from '@/components/cv/A4PageWrapper';
import { CVPageEngine, CVPageEngineItem } from '@/components/cv/CVPageEngine';
import { sanitizeRichText } from '@/lib/sanitizeHtml';
import { filterRenderableItems, hasRenderableSection } from './renderVisibility';
import { normalizeFontSizePreset } from './fontSizePreset';

interface SizeClasses {
  body: string;
  section: string;
  name: string;
  subtitle: string;
  itemTitle: string;
  itemSub: string;
  meta: string;
  avatar: string;
  sectionGap: string;
  itemGap: string;
}

type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

const sectionTitle = (title: string, size: SizeClasses) => (
  <div className={size.sectionGap}>
    <h2
      className={`${size.section} inline-flex items-center gap-2 font-bold uppercase tracking-[0.14em] text-transparent bg-clip-text`}
      style={{
        backgroundImage: 'linear-gradient(95deg, #2563eb 0%, #7c3aed 45%, #ec4899 100%)',
      }}
    >
      <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
      {title}
    </h2>
    <div
      className="mt-1 h-[2px] w-full rounded-full"
      style={{
        background: 'linear-gradient(90deg, rgba(37,99,235,0.95) 0%, rgba(168,85,247,0.95) 50%, rgba(236,72,153,0.95) 100%)',
      }}
    />
  </div>
);

const cardClass = 'rounded-lg border border-fuchsia-100 bg-gradient-to-br from-white via-blue-50/35 to-pink-50/40 px-3 py-2.5';

const renderExperienceItem = (item: CVSectionItem, size: SizeClasses, presentLabel?: string) => {
  const exp = item.content as ExperienceContent;
  return (
    <div className={`${cardClass} ${size.itemGap} break-inside-avoid`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-slate-900`}>{exp.role}</h3>
          <p className={`${size.itemSub} font-semibold text-fuchsia-700`}>{exp.company}</p>
          {exp.location && <p className={`${size.meta} text-slate-600`}>{exp.location}</p>}
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ${size.meta} text-slate-600 border border-slate-200 whitespace-nowrap`}>
          <Calendar size={12} />
          <span>{exp.start_date} - {exp.is_current ? (presentLabel || exp.end_date) : exp.end_date}</span>
        </div>
      </div>
      {exp.description && (
        <div
          className={`${size.body} mt-1.5 max-w-none leading-relaxed text-slate-700 prose prose-sm`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(exp.description) }}
        />
      )}
      {exp.highlights && exp.highlights.length > 0 && (
        <ul className={`${size.meta} mt-1.5 ml-4 list-disc space-y-0.5 text-slate-700`}>
          {exp.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const renderEducationItem = (item: CVSectionItem, size: SizeClasses, presentLabel?: string) => {
  const edu = item.content as EducationContent;
  return (
    <div className={`${cardClass} ${size.itemGap} break-inside-avoid`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-slate-900`}>{edu.degree}</h3>
          <p className={`${size.itemSub} font-semibold text-indigo-700`}>{edu.institution}</p>
          {edu.field_of_study && <p className={`${size.meta} text-slate-600`}>{edu.field_of_study}</p>}
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ${size.meta} text-slate-600 border border-slate-200 whitespace-nowrap`}>
          <Calendar size={12} />
          <span>{edu.start_date} - {edu.is_current ? (presentLabel || edu.end_date) : edu.end_date}</span>
        </div>
      </div>
      {(edu.location || edu.gpa) && (
        <div className={`${size.meta} mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600`}>
          {edu.location && <span>{edu.location}</span>}
          {edu.gpa && <span className="font-medium">GPA: {edu.gpa}</span>}
        </div>
      )}
    </div>
  );
};

const renderProjectItem = (item: CVSectionItem, size: SizeClasses) => {
  const project = item.content as ProjectContent;
  return (
    <div className={`${cardClass} ${size.itemGap} break-inside-avoid`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-slate-900`}>{project.name}</h3>
          {project.role && <p className={`${size.meta} text-slate-600`}>{project.role}</p>}
        </div>
        {(project.start_date || project.end_date) && (
          <div className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ${size.meta} text-slate-600 border border-slate-200 whitespace-nowrap`}>
            <Calendar size={12} />
            <span>{project.start_date} {project.end_date && `- ${project.end_date}`}</span>
          </div>
        )}
      </div>
      <p className={`${size.body} mt-1.5 text-slate-700`}>{project.description}</p>
      {project.technologies && project.technologies.length > 0 && (
        <div className={`${size.meta} mt-1.5 flex flex-wrap gap-1.5`}>
          {project.technologies.map((tech, index) => (
            <span key={`${tech}-${index}`} className="rounded-full border border-fuchsia-200 bg-white px-2 py-0.5 text-fuchsia-700">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const renderCustomItem = (item: CVSectionItem, size: SizeClasses) => {
  const custom = item.content as CustomContent;
  return (
    <div className={`${cardClass} ${size.itemGap}`}>
      <p className={`${size.meta} text-slate-700`}>
        <span className="font-semibold text-slate-900">{custom.label}: </span>
        {custom.value}
      </p>
    </div>
  );
};

const renderGenericItem = (item: CVSectionItem, size: SizeClasses) => {
  const content = item.content as Record<string, unknown>;
  if (!content || typeof content !== 'object') return null;

  const entries = Object.entries(content).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (entries.length === 0) return null;

  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.join(', ');
    return JSON.stringify(value);
  };

  return (
    <div className={`${cardClass} ${size.itemGap} break-inside-avoid`}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${size.body} text-slate-700 mb-1`}>
          <span className="font-semibold capitalize text-slate-900">{key.replace(/_/g, ' ')}: </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(formatValue(value)) }} />
        </div>
      ))}
    </div>
  );
};

export const ElectricGradientTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
  const fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  const labels =
    data.settings?.labels && typeof data.settings.labels === 'object'
      ? (data.settings.labels as Record<string, unknown>)
      : {};
  const presentLabel = typeof labels.present === 'string' ? labels.present : undefined;
  const fontSizePreset = normalizeFontSizePreset(data.settings?.fontSize);

  const sizeClasses = React.useMemo<SizeClasses>(() => {
    switch (fontSizePreset) {
      case 'small':
        return {
          body: 'text-[10px]',
          section: 'text-[11px]',
          name: 'text-[20px]',
          subtitle: 'text-[12px]',
          itemTitle: 'text-[11px]',
          itemSub: 'text-[10px]',
          meta: 'text-[9px]',
          avatar: 'h-24 w-24',
          sectionGap: 'mb-2',
          itemGap: 'mb-2.5',
        };
      case 'large':
        return {
          body: 'text-[13px]',
          section: 'text-[14px]',
          name: 'text-[30px]',
          subtitle: 'text-[16px]',
          itemTitle: 'text-[14px]',
          itemSub: 'text-[13px]',
          meta: 'text-[11px]',
          avatar: 'h-32 w-32',
          sectionGap: 'mb-3',
          itemGap: 'mb-3',
        };
      case 'medium':
      default:
        return {
          body: 'text-[11px]',
          section: 'text-[12px]',
          name: 'text-[24px]',
          subtitle: 'text-[13px]',
          itemTitle: 'text-[12px]',
          itemSub: 'text-[11px]',
          meta: 'text-[10px]',
          avatar: 'h-24 w-24',
          sectionGap: 'mb-2',
          itemGap: 'mb-2',
        };
    }
  }, [fontSizePreset]);

  const items: TemplateItem[] = React.useMemo(() => {
    if (!data?.sections) return [];

    const result: TemplateItem[] = [];
    const headerSection = data.sections.find((section) => section.section_type === 'header');
    const headerItem = headerSection?.is_visible === false ? undefined : filterRenderableItems(headerSection?.items)[0];
    const header = headerItem?.content as HeaderContent | undefined;

    if (header) {
      result.push({
        id: 'electric-header',
        type: 'header',
        render: () => (
          <header className="mb-3 rounded-xl border border-fuchsia-100 bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 px-3 py-3">
            <div className="flex items-start gap-3">
              {header.photo_url && (
                <Image
                  src={header.photo_url}
                  alt={header.full_name}
                  width={112}
                  height={112}
                  unoptimized
                  className={`${sizeClasses.avatar} rounded-2xl object-cover border-2 border-white shadow-sm`}
                />
              )}
              <div className="flex-1">
                {header.full_name && (
                  <h1
                    className={`${sizeClasses.name} font-black leading-tight text-transparent bg-clip-text`}
                    style={{
                      backgroundImage: 'linear-gradient(98deg, #2563eb 0%, #7c3aed 45%, #ec4899 100%)',
                    }}
                  >
                    {header.full_name}
                  </h1>
                )}
                {header.title && <p className={`${sizeClasses.subtitle} font-semibold text-slate-700`}>{header.title}</p>}

                <div className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 ${sizeClasses.meta} text-slate-700`}>
                  {header.email && <span className="inline-flex items-center gap-1.5"><Mail size={12} />{header.email}</span>}
                  {header.phone && <span className="inline-flex items-center gap-1.5"><Phone size={12} />{header.phone}</span>}
                  {header.location && <span className="inline-flex items-center gap-1.5"><MapPin size={12} />{header.location}</span>}
                  {header.website && <span className="inline-flex items-center gap-1.5"><Globe size={12} />{header.website}</span>}
                  {header.linkedin && <span className="inline-flex items-center gap-1.5"><Linkedin size={12} />{header.linkedin}</span>}
                  {header.github && <span className="inline-flex items-center gap-1.5"><Github size={12} />{header.github}</span>}
                </div>

                {header.summary && (
                  <p className={`${sizeClasses.body} mt-1.5 rounded-md border border-white/80 bg-white/70 px-2 py-1.5 text-slate-700 leading-relaxed`}>
                    {header.summary}
                  </p>
                )}
              </div>
            </div>
          </header>
        ),
      });
    }

    const sections = data.sections.filter(
      (section) => section.section_type !== 'header' && hasRenderableSection(section),
    );
    sections.forEach((section) => {
      const sectionItems = filterRenderableItems(section.items);
      if (sectionItems.length === 0) return;

      const isSupportedSection = ['experience', 'education', 'skills', 'projects', 'languages', 'custom'].includes(section.section_type);
      // We now support all sections via generic fallback
      // if (!isSupportedSection) return;

      result.push({
        id: `title-${section.id}`,
        type: 'title',
        render: () => sectionTitle(section.title, sizeClasses),
      });

      if (section.section_type === 'skills') {
        const grouped = sectionItems.reduce((acc, item) => {
          const skill = item.content as SkillContent;
          const category = skill.category || 'General';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill);
          return acc;
        }, {} as Record<string, SkillContent[]>);

        Object.entries(grouped).forEach(([category, skills], index) => {
          result.push({
            id: `skill-group-${section.id}-${index}`,
            type: 'content',
            render: () => (
              <div className={`${cardClass} ${sizeClasses.itemGap}`}>
                <div className={`${sizeClasses.meta} mb-1 font-bold text-indigo-700`}>{category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, skillIndex) => (
                    <span
                      key={`${skill.name}-${skillIndex}`}
                      className={`${sizeClasses.meta} inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-800`}
                    >
                      {skill.name}
                      {(() => {
                        const normalizedLevel = normalizeSkillLevel(skill.level);
                        return normalizedLevel ? ` · ${getSkillLevelLabel(normalizedLevel, data.language)}` : '';
                      })()}
                    </span>
                  ))}
                </div>
              </div>
            ),
          });
        });
        return;
      }

      if (section.section_type === 'languages') {
        result.push({
          id: `lang-grid-${section.id}`,
          type: 'content',
          render: () => (
            <div className={`${sizeClasses.itemGap} grid grid-cols-2 gap-2`}>
              {sectionItems.map((item) => {
                const language = item.content as LanguageContent;
                return (
                  <div key={item.id} className="rounded-md border border-sky-100 bg-sky-50/50 px-3 py-2">
                    <div className={`${sizeClasses.meta} flex items-center justify-between gap-2`}>
                      <span className="font-semibold text-slate-800 truncate">{language.name}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-slate-700 border border-slate-200 whitespace-nowrap">
                        {language.proficiency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        });
        return;
      }

      sectionItems.forEach((item) => {
        let render: (() => React.ReactNode) | null = null;
        if (section.section_type === 'experience') render = () => renderExperienceItem(item, sizeClasses, presentLabel);
        else if (section.section_type === 'education') render = () => renderEducationItem(item, sizeClasses, presentLabel);
        else if (section.section_type === 'projects') render = () => renderProjectItem(item, sizeClasses);
        else if (section.section_type === 'custom') render = () => renderCustomItem(item, sizeClasses);
        else render = () => renderGenericItem(item, sizeClasses);

        result.push({
          id: `item-${item.id}`,
          type: 'content',
          render,
        });
      });
    });

    return result;
  }, [data, presentLabel, sizeClasses]);

  return (
    <div className="electric-gradient-template cv-template-root">
      <CVPageEngine
        items={items}
        renderItem={(item) => item.render()}
        measurementClassName={sizeClasses.body}
        pageWidthMm={210}
        pageHeightMm={297}
        paddingMm={16}
      >
        {(pages) => (
          <>
            {pages.slice(0, previewMode ? 1 : undefined).map((pageItems, pageIndex) => (
              <A4PageWrapper
                key={pageIndex}
                fontFamily={fontFamily}
                widthMm={210}
                heightMm={297}
                paddingMm={16}
                className="electric-gradient-page"
                style={{
                  background:
                    'radial-gradient(circle at 12% 8%, rgba(59,130,246,0.08) 0%, transparent 35%), radial-gradient(circle at 86% 10%, rgba(236,72,153,0.08) 0%, transparent 30%), #ffffff',
                }}
              >
                {pageItems.map((item) => (
                  <React.Fragment key={item.id}>{item.render()}</React.Fragment>
                ))}
              </A4PageWrapper>
            ))}
          </>
        )}
      </CVPageEngine>
    </div>
  );
};
