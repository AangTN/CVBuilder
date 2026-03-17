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
  CertificationContent,
  CustomContent,
  normalizeSkillLevel,
  getSkillLevelLabel,
} from '@/lib/types';
import { A4PageWrapper } from '@/components/cv/A4PageWrapper';
import { CVPageEngine, CVPageEngineItem } from '@/components/cv/CVPageEngine';
import { sanitizeRichText } from '@/lib/sanitizeHtml';
import { formatCvDate, formatCvDateRange } from '@/lib/cvDate';
import { getSafeImageSrc } from '@/lib/imageUrl';
import { filterRenderableItems, hasRenderableContent, hasRenderableSection } from './renderVisibility';
import { normalizeFontSizePreset } from './fontSizePreset';
import { getCustomPrimaryContent, getExtraFields } from './extraFields';

type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

interface SizeClasses {
  name: string;
  title: string;
  contact: string;
  summary: string;
  section: string;
  itemTitle: string;
  itemSub: string;
  body: string;
  meta: string;
}

const headingFont = '"Crimson Text", Georgia, "Times New Roman", serif';
const bodyFontFallback = 'Inter, system-ui, -apple-system, sans-serif';
const templatePrimaryColor = '#002147';
const templateSecondaryColor = '#546E7A';

const formatGender = (value?: string): string => {
  if (!value) return '';
  const token = value.trim().toLowerCase();
  if (token === 'male') return 'Male';
  if (token === 'female') return 'Female';
  if (token === 'other') return 'Other';
  return value;
};

const sectionTitle = (title: string, primaryColor: string, size: SizeClasses) => (
  <div className="mb-1.5 mt-2">
    <h2
      className={`${size.section} font-bold uppercase tracking-[0.09em]`}
      style={{
        color: primaryColor,
        fontFamily: headingFont,
        borderBottom: '0.5pt solid rgba(84, 110, 122, 0.65)',
        paddingBottom: '1px',
      }}
    >
      {title}
    </h2>
  </div>
);

const contactJoin = (parts: string[]) => parts.filter(Boolean).join(' • ');

const renderEducationItem = (
  item: CVSectionItem,
  secondaryColor: string,
  baseLineHeight: number,
  size: SizeClasses,
  presentLabel?: string,
) => {
  const education = item.content as EducationContent;
  const dateRange = formatCvDateRange(education.start_date, education.end_date, education.is_current, presentLabel);
  const extras = getExtraFields(
    education as Record<string, unknown>,
    ['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'gpa', 'description', 'achievements'],
  );
  return (
    <div className="mb-1.5 break-inside-avoid" style={{ lineHeight: baseLineHeight }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className={`${size.itemTitle} font-semibold text-slate-900`}>
            {education.institution}
          </div>
          <div className={`${size.itemSub} font-semibold text-slate-800`}>
            {education.degree}
            {education.field_of_study ? ` — ${education.field_of_study}` : ''}
          </div>
          {education.description && (
            <div className={`mt-0.5 ${size.body} text-slate-700`}>{education.description}</div>
          )}
        </div>
        <div className={`text-right ${size.meta}`} style={{ color: secondaryColor }}>
          {dateRange && <div>{dateRange}</div>}
          {education.location && <div>{education.location}</div>}
        </div>
      </div>
      {(education.gpa || education.achievements?.length) && (
        <div className={`mt-0.5 ${size.meta} text-slate-700`}>
          {education.gpa && <div>GPA: {education.gpa}</div>}
          {education.achievements && education.achievements.length > 0 && (
            <div>Relevant Coursework: {education.achievements.join(', ')}</div>
          )}
        </div>
      )}
      {extras.length > 0 && (
        <div className={`mt-0.5 ${size.meta} text-slate-700`}>
          {extras.map((extra) => (
            <div key={extra.key}>
              <span className="font-semibold capitalize">{extra.label}: </span>
              <span>{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderResearchExperienceItem = (
  item: CVSectionItem,
  secondaryColor: string,
  baseLineHeight: number,
  size: SizeClasses,
  presentLabel?: string,
) => {
  const experience = item.content as ExperienceContent;
  const dateRange = formatCvDateRange(experience.start_date, experience.end_date, experience.is_current, presentLabel);
  const extras = getExtraFields(
    experience as Record<string, unknown>,
    ['company', 'role', 'location', 'employment_type', 'start_date', 'end_date', 'is_current', 'description', 'highlights'],
  );
  return (
    <div className="mb-1.5 break-inside-avoid" style={{ lineHeight: baseLineHeight }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className={`${size.itemTitle} font-semibold text-slate-900`}>{experience.role}</div>
          <div className={`${size.itemSub} text-slate-800`}>{experience.company}</div>
          {experience.employment_type && <div className={`${size.meta} text-slate-700`}>{experience.employment_type}</div>}
        </div>
        <div className={`text-right ${size.meta}`} style={{ color: secondaryColor }}>
          {dateRange && <div>{dateRange}</div>}
          {experience.location && <div>{experience.location}</div>}
        </div>
      </div>

      {experience.description && (
        <div
          className={`mt-0.5 ${size.body} text-slate-700 prose prose-sm max-w-none`}
          style={{ lineHeight: baseLineHeight }}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(experience.description) }}
        />
      )}

      {experience.highlights && experience.highlights.length > 0 && (
        <ul className={`mt-0.5 ml-4 list-disc ${size.body} text-slate-700 space-y-0.5`}>
          {experience.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      )}
      {extras.length > 0 && (
        <div className={`mt-0.5 ${size.meta} text-slate-700`}>
          {extras.map((extra) => (
            <div key={extra.key}>
              <span className="font-semibold capitalize">{extra.label}: </span>
              <span>{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderSkillGroups = (items: CVSectionItem[], baseLineHeight: number, size: SizeClasses, language?: string) => {
  const grouped = items.reduce((acc, item) => {
    const skill = item.content as SkillContent;
    const category = skill.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, SkillContent[]>);

  return (
    <div className="mb-1.5 space-y-0.5" style={{ lineHeight: baseLineHeight }}>
      {Object.entries(grouped).map(([category, skills]: [string, SkillContent[]]) => (
        <div key={category} className={`flex gap-2 ${size.body}`}>
          <span className="min-w-[115px] font-semibold text-slate-800">{category}:</span>
          <span className="text-slate-700">
            {skills.map((skill: SkillContent, index: number) => (
              <span key={`${skill.name}-${index}`}>
                {skill.name}
                {(() => {
                  const normalizedLevel = normalizeSkillLevel(skill.level);
                  return normalizedLevel ? ` (${getSkillLevelLabel(normalizedLevel, language)})` : '';
                })()}
                {(() => {
                  const extras = getExtraFields(skill as Record<string, unknown>, ['name', 'level', 'category']);
                  return extras.length > 0
                    ? ` [${extras.map((extra) => `${extra.label}: ${extra.value}`).join(' | ')}]`
                    : '';
                })()}
                {index < skills.length - 1 && ', '}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

const renderPublicationItem = (item: CVSectionItem, baseLineHeight: number, size: SizeClasses) => {
  const custom = item.content as CustomContent;
  const customRecord = custom as Record<string, unknown>;
  const { label, value } = getCustomPrimaryContent(customRecord);
  const extras = getExtraFields(customRecord, ['label', 'value', 'text']);

  if (!label && !value && extras.length === 0) {
    return null;
  }

  return (
    <div className="mb-1.5 break-inside-avoid" style={{ lineHeight: baseLineHeight }}>
      {(label || value) && (
        <div className={`${size.body} text-slate-800`}>
          {label && <span className="font-semibold">{value ? `${label}: ` : label}</span>}
          {value && <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }} />}
        </div>
      )}
      {extras.map((extra) => (
        <div key={extra.key} className={`${size.meta} text-slate-700`}>
          <span className="font-semibold capitalize">{extra.label}: </span>
          <span>{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderProjectItem = (
  item: CVSectionItem,
  secondaryColor: string,
  baseLineHeight: number,
  size: SizeClasses,
) => {
  const project = item.content as ProjectContent;
  const dateRange = formatCvDateRange(project.start_date, project.end_date);
  const extras = getExtraFields(
    project as Record<string, unknown>,
    ['name', 'role', 'start_date', 'end_date', 'description', 'technologies', 'url', 'github_url'],
  );
  return (
    <div className="mb-1.5 break-inside-avoid" style={{ lineHeight: baseLineHeight }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className={`${size.itemTitle} font-semibold text-slate-900`}>{project.name}</div>
          {project.role && <div className={`${size.itemSub} text-slate-800`}>{project.role}</div>}
        </div>
        {dateRange && (
          <div className={`text-right ${size.meta}`} style={{ color: secondaryColor }}>
            {dateRange}
          </div>
        )}
      </div>
      {project.description && (
        <div className={`mt-0.5 ${size.body} text-slate-700`}>{project.description}</div>
      )}
      {project.technologies && project.technologies.length > 0 && (
        <div className={`mt-0.5 ${size.meta} text-slate-700`}>
          <span className="font-semibold">Tech:</span> {project.technologies.join(', ')}
        </div>
      )}
      {extras.map((extra) => (
        <div key={extra.key} className={`${size.meta} text-slate-700`}>
          <span className="font-semibold capitalize">{extra.label}: </span>
          <span>{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderLanguageItem = (item: CVSectionItem, baseLineHeight: number, size: SizeClasses) => {
  const language = item.content as LanguageContent;
  const extras = getExtraFields(language as Record<string, unknown>, [
    'name',
    'proficiency',
    'certification',
    'certificate',
    'cert',
    'language_certificate',
    'languageCertification',
    'chung_chi',
    'chungChi',
  ]);
  return (
    <div className={`mb-1 break-inside-avoid ${size.body} text-slate-800`} style={{ lineHeight: baseLineHeight }}>
      <span className="font-semibold">{language.name}</span>
      {language.proficiency && <span>: {language.proficiency}</span>}
      {extras.length > 0 && (
        <div className={`${size.meta} text-slate-700`}>
          {extras.map((extra) => (
            <div key={extra.key}>
              <span className="font-semibold capitalize">{extra.label}: </span>
              <span>{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderCertificationItem = (item: CVSectionItem, baseLineHeight: number, size: SizeClasses) => {
  const cert = item.content as CertificationContent;
  const dateRange = formatCvDateRange(cert.issue_date, cert.expiration_date);
  const extras = getExtraFields(cert as Record<string, unknown>, [
    'name',
    'issuer',
    'issue_date',
    'expiration_date',
    'credential_id',
    'credential_url',
    'description',
  ]);

  return (
    <div className={`mb-1.5 break-inside-avoid ${size.body} text-slate-800`} style={{ lineHeight: baseLineHeight }}>
      {cert.name && <span className="font-semibold">{cert.name}</span>}
      {cert.issuer && <span>: {cert.issuer}</span>}
      {dateRange && <div className={`${size.meta} text-slate-700`}>{dateRange}</div>}
      {(cert.credential_id || cert.credential_url) && (
        <div className={`${size.meta} text-slate-700`}>
          {cert.credential_id && (
            <div>
              <span className="font-semibold">ID: </span>
              <span>{cert.credential_id}</span>
            </div>
          )}
          {cert.credential_url && <div className="break-all">{cert.credential_url}</div>}
        </div>
      )}
      {cert.description && <div className={`${size.meta} text-slate-700`}>{cert.description}</div>}
      {extras.length > 0 && (
        <div className={`${size.meta} text-slate-700`}>
          {extras.map((extra) => (
            <div key={extra.key}>
              <span className="font-semibold capitalize">{extra.label}: </span>
              <span>{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderGenericItem = (item: CVSectionItem, baseLineHeight: number, size: SizeClasses) => {
  const content = item.content as Record<string, unknown>;
  if (!content || typeof content !== 'object') {
    return null;
  }

  const entries = Object.entries(content).filter(([, value]) => hasRenderableContent(value));
  if (entries.length === 0) {
    return null;
  }

  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      return value
        .filter((item) => hasRenderableContent(item))
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join(', ');
    }
    return JSON.stringify(value);
  };

  return (
    <div className="mb-1.5 break-inside-avoid" style={{ lineHeight: baseLineHeight }}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${size.body} text-slate-800`}>
          <span className="font-semibold">{key.replace(/_/g, ' ')}: </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(formatValue(value)) }} />
        </div>
      ))}
    </div>
  );
};

export const ScholarEliteTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
  const settings = data.settings || {};
  const bodyFont = bodyFontFallback;
  const primaryColor = templatePrimaryColor;
  const secondaryColor = templateSecondaryColor;
  const spacing = Number(settings?.spacing ?? 1.5);
  const fontSizePreset = normalizeFontSizePreset(settings?.fontSize);
  const labels =
    settings?.labels && typeof settings.labels === 'object'
      ? (settings.labels as Record<string, unknown>)
      : {};
  const presentLabel = typeof labels.present === 'string' ? labels.present : undefined;

  const sizeClasses = React.useMemo<SizeClasses>(() => {
    switch (fontSizePreset) {
      case 'small':
        return {
          name: 'text-[16pt]',
          title: 'text-[9pt]',
          contact: 'text-[8pt]',
          summary: 'text-[8pt]',
          section: 'text-[10pt]',
          itemTitle: 'text-[9pt]',
          itemSub: 'text-[8.5pt]',
          body: 'text-[8pt]',
          meta: 'text-[7.5pt]',
        };
      case 'large':
        return {
          name: 'text-[20pt]',
          title: 'text-[11pt]',
          contact: 'text-[10pt]',
          summary: 'text-[10pt]',
          section: 'text-[12pt]',
          itemTitle: 'text-[11pt]',
          itemSub: 'text-[10.5pt]',
          body: 'text-[10pt]',
          meta: 'text-[9.5pt]',
        };
      case 'medium':
      default:
        return {
          name: 'text-[18pt]',
          title: 'text-[10pt]',
          contact: 'text-[9pt]',
          summary: 'text-[9pt]',
          section: 'text-[11pt]',
          itemTitle: 'text-[10pt]',
          itemSub: 'text-[9.5pt]',
          body: 'text-[9pt]',
          meta: 'text-[8.5pt]',
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
        id: 'scholar-header',
        type: 'header',
        render: () => {
          const headerPhotoSrc = getSafeImageSrc(header.photo_url);
          const contactLine = contactJoin([
            header.email || '',
            header.phone || '',
            header.linkedin || '',
            header.github || '',
            header.facebook || '',
            header.twitter || '',
            header.instagram || '',
            header.website || '',
          ]);

          return (
            <header className="mb-2 relative" style={{ lineHeight: spacing }}>
              {headerPhotoSrc && (
                <Image
                  src={headerPhotoSrc}
                  alt={header.full_name}
                  width={64}
                  height={64}
                  unoptimized
                  className="absolute left-0 top-0 h-16 w-16 rounded-full object-cover border border-slate-300"
                />
              )}

              <div className="text-center px-2">
                {header.full_name && (
                  <h1
                    className={`${sizeClasses.name} font-bold tracking-[0.06em] uppercase`}
                    style={{
                      color: primaryColor,
                      fontFamily: headingFont,
                    }}
                  >
                    {header.full_name}
                  </h1>
                )}
                {header.title && <p className={`${sizeClasses.title} text-slate-700 mt-0.5`}>{header.title}</p>}
                {contactLine && (
                  <p className={`${sizeClasses.contact} text-slate-700 mt-0.5`}>{contactLine}</p>
                )}
                {header.location && (
                  <p className={`${sizeClasses.contact}`} style={{ color: secondaryColor }}>{header.location}</p>
                )}
                {(header.date_of_birth || header.gender) && (
                  <p className={`${sizeClasses.contact} text-slate-700 mt-0.5`}>
                    {[header.date_of_birth ? formatCvDate(header.date_of_birth) : '', formatGender(header.gender)]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                )}
                {header.summary && (
                  <p className={`${sizeClasses.summary} text-slate-700 mt-1 text-justify`}>{header.summary}</p>
                )}
                {getExtraFields(
                  header as Record<string, unknown>,
                  ['full_name', 'title', 'email', 'phone', 'location', 'address', 'date_of_birth', 'gender', 'website', 'linkedin', 'github', 'facebook', 'twitter', 'instagram', 'photo_url', 'summary'],
                ).map((extra) => (
                  <p key={extra.key} className={`${sizeClasses.meta} text-slate-700 mt-0.5`}>
                    <span className="font-semibold capitalize">{extra.label}: </span>
                    <span>{extra.value}</span>
                  </p>
                ))}
              </div>
            </header>
          );
        },
      });
    }

    const visibleSections = data.sections.filter(
      (section) => section.section_type !== 'header' && hasRenderableSection(section),
    );
    visibleSections.forEach((section) => {
      const sectionItems = filterRenderableItems(section.items);
      if (sectionItems.length === 0) {
        return;
      }

      result.push({
        id: `title-${section.id}`,
        type: 'title',
        render: () => sectionTitle(section.title, primaryColor, sizeClasses),
      });

      if (section.section_type === 'education') {
        sectionItems.forEach((item) => {
          result.push({
            id: `edu-${item.id}`,
            type: 'content',
            render: () => renderEducationItem(item, secondaryColor, spacing, sizeClasses, presentLabel),
          });
        });
        return;
      }

      if (section.section_type === 'experience') {
        sectionItems.forEach((item) => {
          result.push({
            id: `exp-${item.id}`,
            type: 'content',
            render: () => renderResearchExperienceItem(item, secondaryColor, spacing, sizeClasses, presentLabel),
          });
        });
        return;
      }

      if (section.section_type === 'skills') {
        result.push({
          id: `skills-${section.id}`,
          type: 'content',
          render: () => renderSkillGroups(sectionItems, spacing, sizeClasses, data.language),
        });
        return;
      }

      if (section.section_type === 'custom') {
        sectionItems.forEach((item) => {
          result.push({
            id: `custom-${item.id}`,
            type: 'content',
            render: () => renderPublicationItem(item, spacing, sizeClasses),
          });
        });
        return;
      }

      if (section.section_type === 'projects') {
        sectionItems.forEach((item) => {
          result.push({
            id: `proj-${item.id}`,
            type: 'content',
            render: () => renderProjectItem(item, secondaryColor, spacing, sizeClasses),
          });
        });
        return;
      }

      if (section.section_type === 'languages') {
        sectionItems.forEach((item) => {
          result.push({
            id: `lang-${item.id}`,
            type: 'content',
            render: () => renderLanguageItem(item, spacing, sizeClasses),
          });
        });
        return;
      }

      if (section.section_type === 'certifications') {
        sectionItems.forEach((item) => {
          result.push({
            id: `cert-${item.id}`,
            type: 'content',
            render: () => renderCertificationItem(item, spacing, sizeClasses),
          });
        });
        return;
      }

      sectionItems.forEach((item) => {
        result.push({
          id: `generic-${item.id}`,
          type: 'content',
          render: () => renderGenericItem(item, spacing, sizeClasses),
        });
      });
    });

    return result;
  }, [data, primaryColor, secondaryColor, spacing, presentLabel, sizeClasses]);

  return (
    <div className="scholar-elite-template cv-template-root">
      <CVPageEngine
        items={items}
        renderItem={(item) => item.render()}
        measurementClassName={sizeClasses.body}
        pageWidthMm={210}
        pageHeightMm={297}
        paddingMm={12}
      >
        {(pages) => (
          <>
            {pages.slice(0, previewMode ? 1 : undefined).map((pageItems, pageIndex) => (
              <A4PageWrapper
                key={pageIndex}
                fontFamily={bodyFont}
                primaryColor={primaryColor}
                widthMm={210}
                heightMm={297}
                paddingMm={12}
                style={{
                  backgroundColor: '#FCFBF9',
                  color: '#1f2937',
                  lineHeight: spacing,
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
