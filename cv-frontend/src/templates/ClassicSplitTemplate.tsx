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
  LanguageContent,
  CertificationContent,
  ProjectContent,
  CustomContent,
  normalizeSkillLevel,
  getSkillLevelLabel,
} from '@/lib/types';
import { Calendar, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { A4PageWrapper } from '@/components/cv/A4PageWrapper';
import { CVPageEngine, CVPageEngineItem } from '@/components/cv/CVPageEngine';
import { sanitizeRichText } from '@/lib/sanitizeHtml';
import { formatCvDate, formatCvDateRange } from '@/lib/cvDate';
import { getSafeImageSrc } from '@/lib/imageUrl';
import { filterRenderableItems } from './renderVisibility';
import { normalizeFontSizePreset } from './fontSizePreset';
import { getCustomPrimaryContent, getExtraFields } from './extraFields';

interface SizeClasses {
  body: string;
  section: string;
  name: string;
  subtitle: string;
  itemTitle: string;
  itemSub: string;
  meta: string;
  small: string;
  avatar: string;
  sectionMb: string;
  blockMb: string;
  listMt: string;
  headerMb: string;
  summaryMt: string;
}

const sectionTitle = (title: string, color: string, size: SizeClasses, isLight = false) => (
  <div className={size.sectionMb}>
    <h2
      className={`${size.section} flex items-center gap-2 font-bold uppercase tracking-[0.12em] ${isLight ? 'text-white' : 'text-gray-800'}`}
      style={{ borderBottom: `1px solid ${color}`, paddingBottom: '6px' }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {title}
    </h2>
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

const renderExtraRows = (
  content: Record<string, unknown>,
  exclude: string[],
  containerClassName: string,
  rowClassName: string,
  labelClassName: string,
) => {
  const extras = getExtraFields(content, exclude);
  if (extras.length === 0) return null;

  return (
    <div className={containerClassName}>
      {extras.map((extra) => (
        <div key={extra.key} className={rowClassName}>
          <span className={labelClassName}>{extra.label}: </span>
          <span>{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderExperienceItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses, presentLabel?: string) => {
  const exp = item.content as ExperienceContent;
  const dateRange = formatCvDateRange(exp.start_date, exp.end_date, exp.is_current, presentLabel);
  return (
    <div className={`${size.blockMb} rounded-sm border-l-2 border-slate-300 pl-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-gray-900`}>{exp.role}</h3>
          <p className={`${size.itemSub} font-medium`} style={{ color: primaryColor }}>{exp.company}</p>
          {exp.employment_type && <p className={`${size.meta} text-gray-500`}>{exp.employment_type}</p>}
          {exp.location && <p className={`${size.meta} text-gray-500`}>{exp.location}</p>}
        </div>
        {dateRange && (
          <div className={`flex items-center gap-1 ${size.meta} text-gray-500 whitespace-nowrap`}>
            <Calendar size={12} />
            <span>{dateRange}</span>
          </div>
        )}
      </div>
      {exp.description && (
        <div
          className={`${size.listMt} ${size.body} leading-relaxed text-gray-600 prose prose-sm max-w-none`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(exp.description) }}
        />
      )}
      {exp.highlights && exp.highlights.length > 0 && (
        <ul className={`${size.listMt} ml-4 list-disc ${size.body} text-gray-600 space-y-0.5`}>
          {exp.highlights.map((h, idx) => (
            <li key={idx}>{h}</li>
          ))}
        </ul>
      )}
      {renderExtraRows(
        exp as Record<string, unknown>,
        ['company', 'role', 'location', 'employment_type', 'start_date', 'end_date', 'is_current', 'description', 'highlights'],
        `${size.listMt} space-y-0.5`,
        `${size.meta} text-gray-600`,
        'font-semibold text-gray-800 capitalize',
      )}
    </div>
  );
};

const renderEducationItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses, presentLabel?: string) => {
  const edu = item.content as EducationContent;
  const dateRange = formatCvDateRange(edu.start_date, edu.end_date, edu.is_current, presentLabel);
  return (
    <div className={`${size.blockMb} rounded-sm border-l-2 border-slate-400/60 pl-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-white`}>{edu.degree}</h3>
          <p className={`${size.meta} text-gray-200`}>{edu.institution}</p>
          {edu.field_of_study && (
            <p className={`${size.meta} text-gray-300`}>{edu.field_of_study}</p>
          )}
        </div>
        {dateRange && <div className={`${size.small} text-gray-300 whitespace-nowrap`}>{dateRange}</div>}
      </div>
      {edu.location && <p className={`${size.small} text-gray-300`}>{edu.location}</p>}
      {edu.gpa && <p className={`${size.small} text-gray-200`}>GPA: {edu.gpa}</p>}
      {renderExtraRows(
        edu as Record<string, unknown>,
        ['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'gpa', 'description', 'achievements'],
        `${size.listMt} space-y-0.5`,
        `${size.small} text-gray-200`,
        'font-semibold text-white/90 capitalize',
      )}
    </div>
  );
};

const renderSkillItem = (item: CVSectionItem, size: SizeClasses, language?: string) => {
  const skill = item.content as SkillContent;
  const normalizedLevel = normalizeSkillLevel(skill.level);
  const extras = getExtraFields(skill as Record<string, unknown>, ['name', 'level', 'category']);
  return (
    <span className={`${size.body} text-gray-200`}>
      {skill.name}
      {normalizedLevel ? ` • ${getSkillLevelLabel(normalizedLevel, language)}` : ''}
      {extras.length > 0
        ? ` • ${extras.map((extra) => `${extra.label}: ${extra.value}`).join(' | ')}`
        : ''}
    </span>
  );
};

const renderLanguageItem = (item: CVSectionItem, size: SizeClasses) => {
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
    <div className={`${size.body} text-gray-200 space-y-0.5`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{lang.name}</span>
        <span className="text-gray-300">{lang.proficiency}</span>
      </div>
      {extras.map((extra) => (
        <div key={extra.key} className={`${size.small} text-gray-300`}>
          <span className="font-semibold capitalize">{extra.label}: </span>
          <span>{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderCertificationItem = (item: CVSectionItem, size: SizeClasses) => {
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
    <div className={`${size.body} text-gray-200 space-y-0.5`}>
      {cert.name && <div className="font-semibold text-gray-100">{cert.name}</div>}
      {cert.issuer && <div className={`${size.small} text-gray-300`}>{cert.issuer}</div>}
      {dateRange && <div className={`${size.small} text-gray-300`}>{dateRange}</div>}
      {cert.credential_id && (
        <div className={`${size.small} text-gray-300`}>
          <span className="font-semibold">ID: </span>
          <span>{cert.credential_id}</span>
        </div>
      )}
      {cert.credential_url && (
        <div className={`${size.small} break-all text-gray-300`}>{cert.credential_url}</div>
      )}
      {cert.description && <div className={`${size.small} text-gray-300`}>{cert.description}</div>}
      {extras.map((extra) => (
        <div key={extra.key} className={`${size.small} text-gray-300`}>
          <span className="font-semibold capitalize">{extra.label}: </span>
          <span>{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderProjectItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
  const project = item.content as ProjectContent;
  const dateRange = formatCvDateRange(project.start_date, project.end_date);
  return (
    <div className={size.blockMb}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`${size.itemTitle} font-semibold text-gray-900`}>{project.name}</h3>
          {project.role && <p className={`${size.itemSub} text-gray-600`}>{project.role}</p>}
        </div>
        {dateRange && (
          <div className={`${size.meta} text-gray-500 whitespace-nowrap`}>
            {dateRange}
          </div>
        )}
      </div>
      {project.description && (
        <p className={`${size.listMt} ${size.body} text-gray-600 leading-relaxed`}>{project.description}</p>
      )}
      {project.technologies && project.technologies.length > 0 && (
        <p className={`${size.meta} text-gray-500`}>
          <span className="font-semibold">Tech:</span> {project.technologies.join(', ')}
        </p>
      )}
      {renderExtraRows(
        project as Record<string, unknown>,
        ['name', 'role', 'start_date', 'end_date', 'description', 'technologies', 'url', 'github_url'],
        `${size.listMt} space-y-0.5`,
        `${size.meta} text-gray-600`,
        'font-semibold text-gray-800 capitalize',
      )}
    </div>
  );
};

const renderCustomItem = (item: CVSectionItem, size: SizeClasses) => {
  const custom = item.content as CustomContent;
  const customRecord = custom as Record<string, unknown>;
  const { label, value } = getCustomPrimaryContent(customRecord);
  const extras = getExtraFields(customRecord, ['label', 'value', 'text']);

  if (!label && !value && extras.length === 0) {
    return null;
  }

  return (
    <div className={`${size.blockMb} ${size.body} rounded-sm border-l-2 border-slate-300 pl-3 text-gray-600 space-y-0.5`}>
      {(label || value) && (
        <div className="whitespace-pre-line">
          {label && <span className="font-semibold text-gray-800">{value ? `${label}: ` : label}</span>}
          {value && <span>{value}</span>}
        </div>
      )}
      {extras.length > 0 && (
        <div className="space-y-0.5">
          {extras.map((extra) => (
            <div key={extra.key} className={`${size.meta} text-gray-600`}>
              <span className="font-semibold text-gray-800 capitalize">{extra.label}: </span>
              <span>{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

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
    <div className={`${size.blockMb} rounded-sm border-l-2 border-slate-300 pl-3`}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${size.body} text-gray-600 mb-1`}>
          <span className="font-semibold capitalize text-gray-800">{key.replace(/_/g, ' ')}: </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(formatValue(value)) }} />
        </div>
      ))}
    </div>
  );
};

export const ClassicSplitTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
  const primaryColor = '#2f3a46';
  const sidebarColor = '#2f3a46';
  const accentColor = '#cfd8dc';
  const labels =
    data.settings?.labels && typeof data.settings.labels === 'object'
      ? (data.settings.labels as Record<string, unknown>)
      : {};
  const contactLabel = typeof labels.contact === 'string' ? labels.contact : undefined;
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
          small: 'text-[8px]',
          avatar: 'h-24 w-24',
          sectionMb: 'mb-2',
          blockMb: 'mb-2.5',
          listMt: 'mt-1',
          headerMb: 'mb-4',
          summaryMt: 'mt-2',
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
          small: 'text-[10px]',
          avatar: 'h-32 w-32',
          sectionMb: 'mb-3',
          blockMb: 'mb-3',
          listMt: 'mt-1.5',
          headerMb: 'mb-6',
          summaryMt: 'mt-2.5',
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
          small: 'text-[9px]',
          avatar: 'h-24 w-24',
          sectionMb: 'mb-2',
          blockMb: 'mb-2',
          listMt: 'mt-0.5',
          headerMb: 'mb-4',
          summaryMt: 'mt-1.5',
        };
    }
  }, [fontSizePreset]);

  const headerSection = data.sections.find(s => s.section_type === 'header');
  const headerItem = headerSection?.is_visible === false ? undefined : filterRenderableItems(headerSection?.items)[0];
  const header = headerItem?.content as HeaderContent | undefined;
  const headerPhotoSrc = getSafeImageSrc(header?.photo_url);

  const experienceSection = data.sections.find(s => s.section_type === 'experience');
  const educationSection = data.sections.find(s => s.section_type === 'education');
  const skillsSection = data.sections.find(s => s.section_type === 'skills');
  const certificationsSection = data.sections.find(s => s.section_type === 'certifications');
  const languagesSection = data.sections.find(s => s.section_type === 'languages');
  const projectsSection = data.sections.find(s => s.section_type === 'projects');
  const customSections = data.sections.filter(s => s.section_type === 'custom');
  const otherSections = data.sections.filter(s => !['header', 'experience', 'education', 'skills', 'certifications', 'languages', 'projects', 'custom'].includes(s.section_type));

  const leftItems: TemplateItem[] = React.useMemo(() => {
    const result: TemplateItem[] = [];

    const hasContactInfo = Boolean(
      header?.phone ||
      header?.email ||
      header?.location ||
      header?.date_of_birth ||
      header?.gender ||
      header?.website ||
      header?.linkedin ||
      header?.github ||
      header?.facebook ||
      header?.twitter ||
      header?.instagram,
    );

    if (headerPhotoSrc) {
      result.push({
        id: 'left-photo',
        type: 'content',
        render: () => (
          <div className={sizeClasses.headerMb + ' flex justify-center'}>
            <Image
              src={headerPhotoSrc}
              alt={header?.full_name || 'Profile photo'}
              width={112}
              height={112}
              unoptimized
              className={`${sizeClasses.avatar} rounded-full object-cover`}
              style={{ border: `3px solid ${accentColor}` }}
            />
          </div>
        ),
      });
    }

    if (hasContactInfo) {
      result.push({
        id: 'left-contact-title',
        type: 'title',
        render: () => sectionTitle(contactLabel || 'LIÊN HỆ', accentColor, sizeClasses, true),
      });

      result.push({
        id: 'left-contact-content',
        type: 'content',
        render: () => (
          <div className={`space-y-2 ${sizeClasses.body} text-gray-200`}>
            {header?.phone && (
              <div className="flex items-center gap-2">
                <Phone size={12} /> {header.phone}
              </div>
            )}
            {header?.email && (
              <div className="flex items-center gap-2">
                <Mail size={12} /> {header.email}
              </div>
            )}
            {header?.location && (
              <div className="flex items-center gap-2">
                <MapPin size={12} /> {header.location}
              </div>
            )}
            {header?.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar size={12} /> {formatCvDate(header.date_of_birth)}
              </div>
            )}
            {header?.gender && (
              <div className="flex items-center gap-2">
                <span className="inline-block min-w-[12px] text-center">•</span> {formatGender(header.gender)}
              </div>
            )}
            {header?.website && (
              <div className="flex items-center gap-2">
                <Globe size={12} /> {header.website}
              </div>
            )}
            {header?.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin size={12} /> {header.linkedin}
              </div>
            )}
            {header?.github && (
              <div className="flex items-center gap-2">
                <Github size={12} /> {header.github}
              </div>
            )}
            {header?.facebook && (
              <div className="flex items-center gap-2">
                <Globe size={12} /> {header.facebook}
              </div>
            )}
            {header?.twitter && (
              <div className="flex items-center gap-2">
                <Globe size={12} /> {header.twitter}
              </div>
            )}
            {header?.instagram && (
              <div className="flex items-center gap-2">
                <Globe size={12} /> {header.instagram}
              </div>
            )}
          </div>
        ),
      });
    }

    const educationItems = filterRenderableItems(educationSection?.items);
    const skillItems = filterRenderableItems(skillsSection?.items);
    const certificationItems = filterRenderableItems(certificationsSection?.items);
    const languageItems = filterRenderableItems(languagesSection?.items);

    if (educationSection && educationSection.is_visible !== false && educationItems.length > 0) {
      result.push({
        id: `left-title-${educationSection.id}`,
        type: 'title',
        render: () => sectionTitle(educationSection.title, accentColor, sizeClasses, true),
      });
      educationItems.forEach((item) => {
        result.push({
          id: `left-edu-${item.id}`,
          type: 'content',
          render: () => renderEducationItem(item, primaryColor, sizeClasses, presentLabel),
        });
      });
    }

    if (skillsSection && skillsSection.is_visible !== false && skillItems.length > 0) {
      result.push({
        id: `left-title-${skillsSection.id}`,
        type: 'title',
        render: () => sectionTitle(skillsSection.title, accentColor, sizeClasses, true),
      });
      skillItems.forEach((item) => {
        result.push({
          id: `left-skill-${item.id}`,
          type: 'content',
          render: () => (
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-200 flex-shrink-0" />
              {renderSkillItem(item, sizeClasses, data.language)}
            </div>
          ),
        });
      });
    }

    if (languagesSection && languagesSection.is_visible !== false && languageItems.length > 0) {
      result.push({
        id: `left-title-${languagesSection.id}`,
        type: 'title',
        render: () => sectionTitle(languagesSection.title, accentColor, sizeClasses, true),
      });
      languageItems.forEach((item) => {
        result.push({
          id: `left-lang-${item.id}`,
          type: 'content',
          render: () => renderLanguageItem(item, sizeClasses),
        });
      });
    }

    if (certificationsSection && certificationsSection.is_visible !== false && certificationItems.length > 0) {
      result.push({
        id: `left-title-${certificationsSection.id}`,
        type: 'title',
        render: () => sectionTitle(certificationsSection.title, accentColor, sizeClasses, true),
      });
      certificationItems.forEach((item) => {
        result.push({
          id: `left-cert-${item.id}`,
          type: 'content',
          render: () => renderCertificationItem(item, sizeClasses),
        });
      });
    }

    return result;
  }, [accentColor, certificationsSection, contactLabel, educationSection, header, headerPhotoSrc, languagesSection, primaryColor, sizeClasses, skillsSection, presentLabel, data.language]);

  const rightItems: TemplateItem[] = React.useMemo(() => {
    const result: TemplateItem[] = [];

    const experienceItems = filterRenderableItems(experienceSection?.items);
    const projectItems = filterRenderableItems(projectsSection?.items);

    if (header) {
      result.push({
        id: 'classic-header',
        type: 'content',
        render: () => (
          <div className={sizeClasses.headerMb}>
            {header.full_name && (
              <h1 className={`${sizeClasses.name} font-bold tracking-wide`} style={{ color: primaryColor }}>
                {header.full_name}
              </h1>
            )}
            {header.title && <p className={`${sizeClasses.subtitle} text-gray-600 font-medium`}>{header.title}</p>}
            {(header.date_of_birth || header.gender) && (
              <div className={`${sizeClasses.summaryMt} flex flex-wrap gap-2 ${sizeClasses.meta} text-gray-600`}>
                {header.date_of_birth && (
                  <span className="rounded-full border border-slate-200 px-2 py-0.5">{formatCvDate(header.date_of_birth)}</span>
                )}
                {header.gender && (
                  <span className="rounded-full border border-slate-200 px-2 py-0.5">{formatGender(header.gender)}</span>
                )}
              </div>
            )}
            {header.summary && (
              <p className={`${sizeClasses.summaryMt} ${sizeClasses.body} rounded-sm border-l-2 border-slate-300 pl-3 text-gray-600 leading-relaxed`}>
                {header.summary}
              </p>
            )}
            {renderExtraRows(
              header as Record<string, unknown>,
              [
                'full_name',
                'title',
                'email',
                'phone',
                'location',
                'address',
                'date_of_birth',
                'gender',
                'website',
                'linkedin',
                'github',
                'facebook',
                'twitter',
                'instagram',
                'photo_url',
                'summary',
              ],
              `${sizeClasses.summaryMt} space-y-0.5`,
              `${sizeClasses.meta} text-gray-600`,
              'font-semibold text-gray-800 capitalize',
            )}
          </div>
        ),
      });
    }

    if (experienceSection && experienceSection.is_visible !== false && experienceItems.length > 0) {
      result.push({
        id: `title-${experienceSection.id}`,
        type: 'title',
        render: () => sectionTitle(experienceSection.title, primaryColor, sizeClasses),
      });
      experienceItems.forEach((item) => {
        result.push({
          id: `exp-${item.id}`,
          type: 'content',
          render: () => renderExperienceItem(item, primaryColor, sizeClasses, presentLabel),
        });
      });
    }

    if (projectsSection && projectsSection.is_visible !== false && projectItems.length > 0) {
      result.push({
        id: `title-${projectsSection.id}`,
        type: 'title',
        render: () => sectionTitle(projectsSection.title, primaryColor, sizeClasses),
      });
      projectItems.forEach((item) => {
        result.push({
          id: `proj-${item.id}`,
          type: 'content',
          render: () => renderProjectItem(item, primaryColor, sizeClasses),
        });
      });
    }

    customSections.forEach((customSection) => {
      const customItems = filterRenderableItems(customSection.items);
      if (customSection.is_visible === false || customItems.length === 0) return;
      result.push({
        id: `title-${customSection.id}`,
        type: 'title',
        render: () => sectionTitle(customSection.title, primaryColor, sizeClasses),
      });
      customItems.forEach((item) => {
        result.push({
          id: `custom-${item.id}`,
          type: 'content',
          render: () => renderCustomItem(item, sizeClasses),
        });
      });
    });

    otherSections.forEach((otherSection) => {
      const otherItems = filterRenderableItems(otherSection.items);
      if (otherSection.is_visible === false || otherItems.length === 0) return;
      result.push({
        id: `title-${otherSection.id}`,
        type: 'title',
        render: () => sectionTitle(otherSection.title, primaryColor, sizeClasses),
      });
      otherItems.forEach((item) => {
        result.push({
          id: `other-${item.id}`,
          type: 'content',
          render: () => renderGenericItem(item, sizeClasses),
        });
      });
    });

    return result;
  }, [customSections, otherSections, experienceSection, header, primaryColor, projectsSection, sizeClasses, presentLabel]);

  return (
    <div className="classic-split-template cv-template-root">
      <CVPageEngine
        items={leftItems}
        renderItem={(item) => (
          <div
            style={{
              width: '32%',
              paddingLeft: '10mm',
              paddingRight: '10mm',
            }}
          >
            {item.render()}
          </div>
        )}
        measurementClassName={sizeClasses.body}
        pageWidthMm={210}
        pageHeightMm={297}
        paddingMm={0}
        reservedHeightMm={36}
      >
        {(leftPages) => (
          <CVPageEngine
            items={rightItems}
            renderItem={(item) => (
              <div
                style={{
                  width: '68%',
                  marginLeft: '32%',
                  paddingLeft: '12mm',
                  paddingRight: '12mm',
                }}
              >
                {item.render()}
              </div>
            )}
            measurementClassName={sizeClasses.body}
            pageWidthMm={210}
            pageHeightMm={297}
            paddingMm={0}
            reservedHeightMm={36}
          >
            {(rightPages) => {
              const totalPages = Math.max(leftPages.length, rightPages.length);
              const pages = Array.from({ length: totalPages }, (_, index) => ({
                left: leftPages[index] || [],
                right: rightPages[index] || [],
              }));

              return (
                <>
                  {pages.slice(0, previewMode ? 1 : undefined).map((page, pageIndex) => (
                    <A4PageWrapper
                      key={pageIndex}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      widthMm={210}
                      heightMm={297}
                      paddingMm={0}
                    >
                      <div
                        className="h-full grid"
                        style={{
                          gridTemplateColumns: '32% 68%',
                        }}
                      >
                        <aside
                          style={{
                            backgroundColor: sidebarColor,
                            color: 'white',
                            padding: '18mm 10mm',
                          }}
                        >
                          {page.left.map((item) => (
                            <React.Fragment key={item.id}>{item.render()}</React.Fragment>
                          ))}
                        </aside>
                        <main style={{ padding: '18mm 12mm' }}>
                          {page.right.map((item) => (
                            <React.Fragment key={item.id}>{item.render()}</React.Fragment>
                          ))}
                        </main>
                      </div>
                    </A4PageWrapper>
                  ))}
                </>
              );
            }}
          </CVPageEngine>
        )}
      </CVPageEngine>
    </div>
  );
};
