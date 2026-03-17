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
import { filterRenderableItems, hasRenderableSection } from './renderVisibility';
import { normalizeFontSizePreset } from './fontSizePreset';
import { getCustomPrimaryContent, getExtraFields } from './extraFields';
import { formatCvDate, formatCvDateRange } from '@/lib/cvDate';
import { getSafeImageSrc } from '@/lib/imageUrl';

const Line: React.FC<{ children: React.ReactNode; dim?: boolean; className?: string }> = ({ children, dim, className }) => (
  <div className={`${dim ? 'text-green-300/70' : 'text-green-300'}${className ? ` ${className}` : ''}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ title: string; sizeClass?: string }> = ({ title, sizeClass }) => (
  <div className="mt-3 mb-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
    <span className={`text-emerald-400 font-bold${sizeClass ? ` ${sizeClass}` : ''}`}>$</span>{' '}
    <span className={`font-bold tracking-wider${sizeClass ? ` ${sizeClass}` : ''}`}>{title.toUpperCase()}</span>
  </div>
);

const formatGender = (value?: string): string => {
  if (!value) return '';
  const token = value.trim().toLowerCase();
  if (token === 'male') return 'Male';
  if (token === 'female') return 'Female';
  if (token === 'other') return 'Other';
  return value;
};

const renderExperience = (item: CVSectionItem, presentLabel?: string) => {
  const exp = item.content as ExperienceContent;
  const dateRange = formatCvDateRange(exp.start_date, exp.end_date, exp.is_current, presentLabel);
  const extras = getExtraFields(
    exp as Record<string, unknown>,
    ['company', 'role', 'location', 'employment_type', 'start_date', 'end_date', 'is_current', 'description', 'highlights'],
  );
  return (
    <div className="mb-2 rounded border border-emerald-500/20 bg-emerald-500/[0.03] px-2 py-1.5">
      <Line>
        {dateRange ? `[${dateRange}] ` : ''}{exp.role} @ {exp.company}
      </Line>
      {exp.employment_type && <Line dim>employment: {exp.employment_type}</Line>}
      {exp.location && <Line dim>location: {exp.location}</Line>}
      {exp.description && (
        <Line dim>
          {exp.description.replace(/<[^>]*>/g, '')}
        </Line>
      )}
      {exp.highlights && exp.highlights.length > 0 && (
        <div className="pl-3">
          {exp.highlights.map((h, idx) => (
            <Line key={idx} dim>- {h}</Line>
          ))}
        </div>
      )}
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

const renderEducation = (item: CVSectionItem, presentLabel?: string) => {
  const edu = item.content as EducationContent;
  const dateRange = formatCvDateRange(edu.start_date, edu.end_date, edu.is_current, presentLabel);
  const extras = getExtraFields(
    edu as Record<string, unknown>,
    ['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'gpa', 'description', 'achievements'],
  );
  return (
    <div className="mb-2 rounded border border-emerald-500/20 bg-emerald-500/[0.03] px-2 py-1.5">
      <Line>
        {dateRange ? `[${dateRange}] ` : ''}{edu.degree} @ {edu.institution}
      </Line>
      {edu.field_of_study && <Line dim>field: {edu.field_of_study}</Line>}
      {edu.location && <Line dim>location: {edu.location}</Line>}
      {edu.gpa && <Line dim>gpa: {edu.gpa}</Line>}
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

const renderSkill = (item: CVSectionItem, language?: string) => {
  const skill = item.content as SkillContent;
  const normalizedLevel = normalizeSkillLevel(skill.level);
  const extras = getExtraFields(skill as Record<string, unknown>, ['name', 'level', 'category']);
  return (
    <Line dim>
      - {skill.name}
      {normalizedLevel ? ` (${getSkillLevelLabel(normalizedLevel, language)})` : ''}
      {extras.length > 0
        ? ` | ${extras.map((extra) => `${extra.label}: ${extra.value}`).join(' | ')}`
        : ''}
    </Line>
  );
};

const renderProject = (item: CVSectionItem) => {
  const project = item.content as ProjectContent;
  const dateRange = formatCvDateRange(project.start_date, project.end_date);
  const extras = getExtraFields(
    project as Record<string, unknown>,
    ['name', 'role', 'start_date', 'end_date', 'description', 'technologies', 'url', 'github_url'],
  );
  return (
    <div className="mb-2 rounded border border-emerald-500/20 bg-emerald-500/[0.03] px-2 py-1.5">
      <Line>{project.name}{project.role ? ` :: ${project.role}` : ''}</Line>
      {dateRange && <Line dim>timeline: {dateRange}</Line>}
      {project.description && <Line dim>{project.description}</Line>}
      {project.technologies && project.technologies.length > 0 && (
        <Line dim>tech: {project.technologies.join(', ')}</Line>
      )}
      {project.url && <Line dim>url: {project.url}</Line>}
      {project.github_url && <Line dim>github: {project.github_url}</Line>}
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

const renderLanguage = (item: CVSectionItem) => {
  const lang = item.content as LanguageContent;
  const extras = getExtraFields(lang as Record<string, unknown>, [
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
    <div>
      <Line dim>
        - {lang.name}
        {lang.proficiency ? `: ${lang.proficiency}` : ''}
      </Line>
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

const renderCertification = (item: CVSectionItem) => {
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
    <div className="mb-2 rounded border border-emerald-500/20 bg-emerald-500/[0.03] px-2 py-1.5">
      <Line>{cert.name || 'Certification'}{cert.issuer ? ` :: ${cert.issuer}` : ''}</Line>
      {dateRange && <Line dim>timeline: {dateRange}</Line>}
      {cert.credential_id && <Line dim>credential id: {cert.credential_id}</Line>}
      {cert.credential_url && <Line dim>credential url: {cert.credential_url}</Line>}
      {cert.description && <Line dim>{cert.description}</Line>}
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

const renderCustom = (item: CVSectionItem) => {
  const custom = item.content as CustomContent;
  const customRecord = custom as Record<string, unknown>;
  const { label, value } = getCustomPrimaryContent(customRecord);
  const plainValue = value.replace(/<[^>]*>/g, '');
  const extras = getExtraFields(customRecord, ['label', 'value', 'text']);

  if (!label && !plainValue && extras.length === 0) {
    return null;
  }

  return (
    <div>
      {(label || plainValue) && (
        <Line dim>{label ? `${label}${plainValue ? ':' : ''}` : ''}{plainValue ? `${label ? ' ' : ''}${plainValue}` : ''}</Line>
      )}
      {extras.map((extra) => (
        <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
      ))}
    </div>
  );
};

type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

const renderGenericItem = (item: CVSectionItem) => {
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
    <div className="mb-2 rounded border border-emerald-500/20 bg-emerald-500/[0.03] px-2 py-1.5">
      {entries.map(([key, value]) => (
        <Line key={key} dim>
          {key.replace(/_/g, ' ')}: {formatValue(value).replace(/<[^>]*>/g, '')}
        </Line>
      ))}
    </div>
  );
};

export const TechTerminalTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
  const settings = data.settings || {};
  const fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  const fontSizePreset = normalizeFontSizePreset(settings.fontSize);
  const labels =
    settings?.labels && typeof settings.labels === 'object'
      ? (settings.labels as Record<string, unknown>)
      : {};
  const presentLabel = typeof labels.present === 'string' ? labels.present : undefined;
  const sizeClasses = React.useMemo(() => {
    switch (fontSizePreset) {
      case 'small':
        return { body: 'text-[10px]', section: 'text-[11px]', name: 'text-[18px]', avatar: 'h-16 w-16' };
      case 'large':
        return { body: 'text-[13px]', section: 'text-[14px]', name: 'text-[26px]', avatar: 'h-24 w-24' };
      case 'medium':
      default:
        return { body: 'text-[11px]', section: 'text-[12px]', name: 'text-[22px]', avatar: 'h-20 w-20' };
    }
  }, [fontSizePreset]);
  const headerSection = data.sections.find(s => s.section_type === 'header');
  const headerItem = headerSection?.is_visible === false ? undefined : filterRenderableItems(headerSection?.items)[0];
  const header = headerItem?.content as HeaderContent | undefined;
  const headerPhotoSrc = getSafeImageSrc(header?.photo_url);

  const items: TemplateItem[] = React.useMemo(() => {
    if (!data?.sections) return [];

    const result: TemplateItem[] = [];

    if (header) {
      result.push({
        id: 'terminal-header',
        type: 'header',
        render: () => (
          <div className={`mb-3 ${sizeClasses.body}`}>
            <div className="flex items-start gap-3">
              {headerPhotoSrc && (
                <Image
                  src={headerPhotoSrc}
                  alt={header.full_name}
                  width={112}
                  height={112}
                  unoptimized
                  className={`${sizeClasses.avatar} rounded-full object-cover border-2 border-emerald-400`}
                />
              )}
              <div className="flex-1">
                {([header.full_name, header.title].filter(Boolean).join(' — ')) && (
                  <Line className={sizeClasses.name}>
                    {[header.full_name, header.title].filter(Boolean).join(' — ')}
                  </Line>
                )}
                {header.summary && <Line dim>{header.summary}</Line>}
                {getExtraFields(
                  header as Record<string, unknown>,
                  ['full_name', 'title', 'email', 'phone', 'location', 'address', 'date_of_birth', 'gender', 'website', 'linkedin', 'github', 'facebook', 'twitter', 'instagram', 'photo_url', 'summary'],
                ).map((extra) => (
                  <Line key={extra.key} dim>{extra.label}: {extra.value}</Line>
                ))}
              </div>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
              {header.email && <Line dim>email: {header.email}</Line>}
              {header.phone && <Line dim>phone: {header.phone}</Line>}
              {header.location && <Line dim>location: {header.location}</Line>}
              {header.date_of_birth && <Line dim>dob: {formatCvDate(header.date_of_birth)}</Line>}
              {header.gender && <Line dim>gender: {formatGender(header.gender)}</Line>}
              {header.website && <Line dim>site: {header.website}</Line>}
              {header.github && <Line dim>github: {header.github}</Line>}
              {header.linkedin && <Line dim>linkedin: {header.linkedin}</Line>}
              {header.facebook && <Line dim>facebook: {header.facebook}</Line>}
              {header.twitter && <Line dim>twitter: {header.twitter}</Line>}
              {header.instagram && <Line dim>instagram: {header.instagram}</Line>}
            </div>
          </div>
        ),
      });
    }

    const otherSections = data.sections.filter(
      (section) => section.section_type !== 'header' && hasRenderableSection(section),
    );
    otherSections.forEach(section => {
      const sectionItems = filterRenderableItems(section.items);
      if (sectionItems.length === 0) return;

      result.push({
        id: `title-${section.id}`,
        type: 'title',
        render: () => <SectionTitle title={section.title} sizeClass={sizeClasses.section} />,
      });

      if (section.section_type === 'experience') {
        sectionItems.forEach(item => {
          result.push({ id: `exp-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderExperience(item, presentLabel)}</div> });
        });
      } else if (section.section_type === 'education') {
        sectionItems.forEach(item => {
          result.push({ id: `edu-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderEducation(item, presentLabel)}</div> });
        });
      } else if (section.section_type === 'skills') {
        sectionItems.forEach(item => {
          result.push({ id: `skill-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderSkill(item, data.language)}</div> });
        });
      } else if (section.section_type === 'projects') {
        sectionItems.forEach(item => {
          result.push({ id: `proj-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderProject(item)}</div> });
        });
      } else if (section.section_type === 'languages') {
        sectionItems.forEach(item => {
          result.push({ id: `lang-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderLanguage(item)}</div> });
        });
      } else if (section.section_type === 'certifications') {
        sectionItems.forEach(item => {
          result.push({ id: `cert-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderCertification(item)}</div> });
        });
      } else if (section.section_type === 'custom') {
        sectionItems.forEach(item => {
          result.push({ id: `custom-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderCustom(item)}</div> });
        });
      } else {
        sectionItems.forEach(item => {
          result.push({ id: `generic-${item.id}`, type: 'content', render: () => <div className={sizeClasses.body}>{renderGenericItem(item)}</div> });
        });
      }
    });

    return result;
  }, [data, header, headerPhotoSrc, sizeClasses.section, sizeClasses.avatar, sizeClasses.name, sizeClasses.body, presentLabel]);

  return (
    <div className="tech-terminal-template cv-template-root">
      <CVPageEngine
        items={items}
        renderItem={(item) => item.render()}
        measurementClassName={sizeClasses.body}
        pageWidthMm={210}
        pageHeightMm={297}
        paddingMm={12}
        reservedHeightMm={22}
        bufferPx={20}
      >
        {(pages) => (
          <>
            {pages.slice(0, previewMode ? 1 : undefined).map((pageItems, pageIndex) => (
              <A4PageWrapper
                key={pageIndex}
                fontFamily={fontFamily}
                widthMm={210}
                heightMm={297}
                paddingMm={12}
                className="tech-terminal-page"
                style={{
                  background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0f1419 100%)',
                  color: '#86efac',
                  border: '1px solid #1f2937',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                }}
              >
                {/* Scanline Effect Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, transparent 1px, transparent 2px, rgba(0, 0, 0, 0.15) 3px)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                {/* Noise Texture Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
                {/* Gradient Overlay for Depth */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Terminal Top Bar */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <div className="ml-3 text-xs text-emerald-300/70">~/cv — zsh</div>
                  </div>

                  <div className={`space-y-1 ${sizeClasses.body} flex-1`} style={{ paddingBottom: '10mm' }}>
                    {pageItems.map((item) => (
                      <React.Fragment key={item.id}>{item.render()}</React.Fragment>
                    ))}
                  </div>
                </div>
              </A4PageWrapper>
            ))}
          </>
        )}
      </CVPageEngine>
    </div>
  );
};
