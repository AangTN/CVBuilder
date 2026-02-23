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
import { A4PageWrapper } from '@/components/cv/A4PageWrapper';
import { CVPageEngine, CVPageEngineItem } from '@/components/cv/CVPageEngine';
import { Calendar, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
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
  sectionMb: string;
  blockMb: string;
}

type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

const neonGlowText = {
  textShadow: '0 0 10px rgba(34,197,94,0.45), 0 0 24px rgba(236,72,153,0.25)',
};

const sectionTitle = (title: string, size: SizeClasses) => (
  <div className={size.sectionMb}>
    <h2
      className={`${size.section} inline-flex items-center gap-2 font-bold uppercase tracking-[0.16em]`}
      style={{
        color: '#a7f3d0',
        ...neonGlowText,
      }}
    >
      <span
        className="inline-block h-1.5 w-6 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #22c55e 0%, #e879f9 100%)',
          boxShadow: '0 0 12px rgba(34,197,94,0.5)',
        }}
      />
      {title}
    </h2>
  </div>
);

const glassPanel = {
  background: 'linear-gradient(130deg, rgba(30,41,59,0.72) 0%, rgba(17,24,39,0.66) 100%)',
  border: '1px solid rgba(134,239,172,0.22)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 14px rgba(16,185,129,0.12)',
};

const renderExperienceItem = (item: CVSectionItem, size: SizeClasses, presentLabel?: string) => {
  const exp = item.content as ExperienceContent;
  return (
    <div className={`${size.blockMb} rounded-lg p-2.5 break-inside-avoid`} style={glassPanel}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-emerald-200`}>{exp.role}</h3>
          <p className={`${size.itemSub} text-fuchsia-300`}>{exp.company}</p>
          {exp.location && <p className={`${size.meta} text-emerald-100/75`}>{exp.location}</p>}
        </div>
        <div className={`${size.meta} inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-100 whitespace-nowrap`}>
          <Calendar size={12} />
          <span>{exp.start_date} - {exp.is_current ? (presentLabel || exp.end_date) : exp.end_date}</span>
        </div>
      </div>
      {exp.description && (
        <div
          className={`${size.body} mt-2 prose prose-sm max-w-none leading-relaxed text-emerald-50/90`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(exp.description) }}
        />
      )}
      {exp.highlights && exp.highlights.length > 0 && (
        <ul className={`${size.meta} mt-1.5 ml-4 list-disc text-emerald-50/85 space-y-0.5`}>
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
    <div className={`${size.blockMb} rounded-lg p-2.5 break-inside-avoid`} style={glassPanel}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-emerald-200`}>{edu.degree}</h3>
          <p className={`${size.itemSub} text-fuchsia-300`}>{edu.institution}</p>
          {edu.field_of_study && <p className={`${size.meta} text-emerald-100/75`}>{edu.field_of_study}</p>}
        </div>
        <div className={`${size.meta} inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-100 whitespace-nowrap`}>
          <Calendar size={12} />
          <span>{edu.start_date} - {edu.is_current ? (presentLabel || edu.end_date) : edu.end_date}</span>
        </div>
      </div>
      {(edu.location || edu.gpa) && (
        <div className={`${size.meta} mt-1.5 flex flex-wrap gap-2 text-emerald-100/80`}>
          {edu.location && <span>{edu.location}</span>}
          {edu.gpa && <span>GPA: {edu.gpa}</span>}
        </div>
      )}
    </div>
  );
};

const renderProjectItem = (item: CVSectionItem, size: SizeClasses) => {
  const project = item.content as ProjectContent;
  return (
    <div className={`${size.blockMb} rounded-lg p-2.5 break-inside-avoid`} style={glassPanel}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-emerald-200`}>{project.name}</h3>
          {project.role && <p className={`${size.meta} text-emerald-100/80`}>{project.role}</p>}
        </div>
        {(project.start_date || project.end_date) && (
          <div className={`${size.meta} text-emerald-100 whitespace-nowrap`}>
            {project.start_date} {project.end_date && `- ${project.end_date}`}
          </div>
        )}
      </div>
      {project.description && <p className={`${size.body} mt-1.5 text-emerald-50/90`}>{project.description}</p>}
      {project.technologies && project.technologies.length > 0 && (
        <div className={`${size.meta} mt-1.5 flex flex-wrap gap-1.5`}>
          {project.technologies.map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className="rounded-full border border-fuchsia-300/35 bg-fuchsia-500/15 px-2 py-0.5 text-fuchsia-100"
            >
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
    <div className={`${size.blockMb} rounded-lg p-2.5`} style={glassPanel}>
      <p className={`${size.meta} text-emerald-50/90`}>
        <span className="font-semibold text-emerald-200">{custom.label}: </span>
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
    <div className={`${size.blockMb} rounded-lg p-2.5 break-inside-avoid`} style={glassPanel}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${size.body} text-emerald-50/90 mb-1`}>
          <span className="font-semibold capitalize text-emerald-200">{key.replace(/_/g, ' ')}: </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(formatValue(value)) }} />
        </div>
      ))}
    </div>
  );
};

export const NeonPulseTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
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
          sectionMb: 'mb-2',
          blockMb: 'mb-2.5',
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
          sectionMb: 'mb-3',
          blockMb: 'mb-3',
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
          sectionMb: 'mb-2',
          blockMb: 'mb-2',
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
        id: 'neon-header',
        type: 'header',
        render: () => (
          <header className="mb-3 rounded-xl border border-emerald-300/25 bg-slate-900/65 p-3" style={{ boxShadow: '0 0 22px rgba(236,72,153,0.18)' }}>
            <div className="flex items-start gap-3">
              {header.photo_url && (
                <Image
                  src={header.photo_url}
                  alt={header.full_name}
                  width={112}
                  height={112}
                  unoptimized
                  className={`${sizeClasses.avatar} rounded-xl object-cover border border-fuchsia-300/50`}
                  style={{ boxShadow: '0 0 16px rgba(236,72,153,0.35)' }}
                />
              )}
              <div className="flex-1">
                {header.full_name && (
                  <h1 className={`${sizeClasses.name} font-black text-emerald-200`} style={neonGlowText}>
                    {header.full_name}
                  </h1>
                )}
                {header.title && <p className={`${sizeClasses.subtitle} text-fuchsia-200`}>{header.title}</p>}

                <div className={`${sizeClasses.meta} mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-emerald-100/90`}>
                  {header.email && <span className="inline-flex items-center gap-1"><Mail size={12} />{header.email}</span>}
                  {header.phone && <span className="inline-flex items-center gap-1"><Phone size={12} />{header.phone}</span>}
                  {header.location && <span className="inline-flex items-center gap-1"><MapPin size={12} />{header.location}</span>}
                  {header.website && <span className="inline-flex items-center gap-1"><Globe size={12} />{header.website}</span>}
                  {header.linkedin && <span className="inline-flex items-center gap-1"><Linkedin size={12} />{header.linkedin}</span>}
                  {header.github && <span className="inline-flex items-center gap-1"><Github size={12} />{header.github}</span>}
                </div>

                {header.summary && (
                  <p className={`${sizeClasses.body} mt-1.5 rounded-md border border-emerald-300/20 bg-emerald-500/5 px-2.5 py-1.5 text-emerald-50/90`}>
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
            id: `skill-${section.id}-${index}`,
            type: 'content',
            render: () => (
              <div className={`${sizeClasses.blockMb} rounded-lg p-3`} style={glassPanel}>
                <div className={`${sizeClasses.meta} mb-1 font-semibold text-fuchsia-200`}>{category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, skillIndex) => (
                    <span
                      key={`${skill.name}-${skillIndex}`}
                      className={`${sizeClasses.meta} rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-100`}
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
            <div className={`${sizeClasses.blockMb} grid grid-cols-2 gap-2`}>
              {sectionItems.map((item) => {
                const lang = item.content as LanguageContent;
                return (
                  <div key={item.id} className="rounded-md border border-fuchsia-300/25 bg-fuchsia-500/10 px-3 py-2">
                    <div className={`${sizeClasses.meta} flex items-center justify-between gap-2`}>
                      <span className="font-semibold text-emerald-100 truncate">{lang.name}</span>
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-100 whitespace-nowrap">
                        {lang.proficiency}
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
    <div className="neon-pulse-template cv-template-root">
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
                style={{
                  background:
                    'radial-gradient(circle at 15% 12%, rgba(34,197,94,0.14) 0%, transparent 30%), radial-gradient(circle at 82% 8%, rgba(236,72,153,0.18) 0%, transparent 28%), radial-gradient(circle at 78% 80%, rgba(139,92,246,0.14) 0%, transparent 32%), #020617',
                  color: '#dcfce7',
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
