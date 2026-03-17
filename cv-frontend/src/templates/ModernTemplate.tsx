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
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { A4PageWrapper } from '@/components/cv/A4PageWrapper';
import { CVPageEngine, CVPageEngineItem } from '@/components/cv/CVPageEngine';
import { sanitizeRichText } from '@/lib/sanitizeHtml';
import { formatCvDate, formatCvDateRange } from '@/lib/cvDate';
import { getSafeImageSrc } from '@/lib/imageUrl';
import { normalizeFontSizePreset } from './fontSizePreset';
import { filterRenderableItems, hasRenderableSection } from './renderVisibility';
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
  headerGap: string;
  headerMb: string;
  headerPb: string;
  summaryMt: string;
  sectionSpacer: string;
  sectionTitleMb: string;
  itemMb: string;
  listMt: string;
  metaGapX: string;
  metaGapY: string;
}

const formatGender = (value?: string): string => {
  if (!value) return '';
  const token = value.trim().toLowerCase();
  if (token === 'male') return 'Male';
  if (token === 'female') return 'Female';
  if (token === 'other') return 'Other';
  return value;
};

// Helper to render extra properties that are not part of the standard schema
const ExtraProperties: React.FC<{ data: Record<string, unknown>; exclude: string[]; sizeClass?: string }> = ({ data, exclude, sizeClass }) => {
  const extras = getExtraFields(data, exclude);

  if (extras.length === 0) return null;

  return (
    <div className="mt-1 space-y-1">
      {extras.map((extra) => (
        <div key={extra.key} className={sizeClass || 'text-sm'}>
          <span className="font-semibold text-gray-700 capitalize">{extra.label}: </span>
          <span className="text-gray-600">{extra.value}</span>
        </div>
      ))}
    </div>
  );
};

// --- Atomic Rendering Helpers (Stateless) ---

const renderHeader = (header: HeaderContent, primaryColor: string, size: SizeClasses) => {
  const headerPhotoSrc = getSafeImageSrc(header.photo_url);

  return (
    <header
      className={`${size.headerMb} ${size.headerPb} relative`}
      style={{ borderBottom: `2px solid ${primaryColor}` }}
    >
      <div className={`flex items-start ${size.headerGap}`}>
        {headerPhotoSrc && (
          <Image
            src={headerPhotoSrc}
            alt={header.full_name}
            width={112}
            height={112}
            unoptimized
            className={`${size.avatar} rounded-full object-cover`}
            style={{ border: `3px solid ${primaryColor}` }}
          />
        )}
        <div className="flex-1">
        {header.full_name && (
          <h1 className={`${size.name} font-bold mb-1`} style={{ color: primaryColor }}>
            {header.full_name}
          </h1>
        )}
        {header.title && <p className={`${size.subtitle} text-gray-600 mb-3 font-medium`}>{header.title}</p>}
        
        <div className={`flex flex-wrap ${size.metaGapX} ${size.metaGapY} ${size.meta} text-gray-700`}>
          {header.email && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Mail size={14} style={{ color: primaryColor }} /> {header.email}
            </span>
          )}
          {header.phone && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Phone size={14} style={{ color: primaryColor }} /> {header.phone}
            </span>
          )}
          {header.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <MapPin size={14} style={{ color: primaryColor }} /> {header.location}
            </span>
          )}
          {header.date_of_birth && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Calendar size={14} style={{ color: primaryColor }} /> {formatCvDate(header.date_of_birth)}
            </span>
          )}
          {header.gender && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              {formatGender(header.gender)}
            </span>
          )}
          {header.website && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Globe size={14} style={{ color: primaryColor }} /> {header.website}
            </span>
          )}
          {header.linkedin && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Linkedin size={14} style={{ color: primaryColor }} /> {header.linkedin}
            </span>
          )}
          {header.github && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Github size={14} style={{ color: primaryColor }} /> {header.github}
            </span>
          )}
          {header.facebook && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Globe size={14} style={{ color: primaryColor }} /> {header.facebook}
            </span>
          )}
          {header.twitter && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Globe size={14} style={{ color: primaryColor }} /> {header.twitter}
            </span>
          )}
          {header.instagram && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Globe size={14} style={{ color: primaryColor }} /> {header.instagram}
            </span>
          )}
        </div>
        
        {header.summary && (
          <p className={`${size.summaryMt} text-gray-700 leading-relaxed ${size.body}`}>
            {header.summary}
          </p>
        )}

        <ExtraProperties 
          data={header} 
          exclude={['full_name', 'title', 'email', 'phone', 'location', 'address', 'date_of_birth', 'gender', 'website', 'linkedin', 'github', 'facebook', 'twitter', 'instagram', 'photo_url', 'summary']} 
          sizeClass={size.body}
        />
        </div>
      </div>
    </header>
  );
};

const renderSectionTitle = (title: string, primaryColor: string, size: SizeClasses) => (
  <h2
    className={`${size.section} ${size.sectionTitleMb} flex items-center gap-2 pb-1.5 font-bold uppercase tracking-[0.14em]`}
    style={{ color: primaryColor, borderBottom: `1.5px solid ${primaryColor}` }}
  >
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: primaryColor }}
    />
    {title}
  </h2>
);

const renderExperienceItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses, presentLabel?: string) => {
  const exp = item.content as ExperienceContent;
  const dateRange = formatCvDateRange(exp.start_date, exp.end_date, exp.is_current, presentLabel);
  return (
    <div className={`${size.itemMb} break-inside-avoid rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2`}>
      <div className="flex justify-between items-start mb-1.5 gap-4">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-gray-900`}>{exp.role}</h3>
          <p className={`${size.itemSub} font-semibold`} style={{ color: primaryColor }}>{exp.company}</p>
          {exp.employment_type && <p className={`${size.meta} text-gray-600`}>{exp.employment_type}</p>}
          {exp.location && <p className={`${size.meta} text-gray-600`}>{exp.location}</p>}
        </div>
        {dateRange && (
          <div className={`text-right ${size.meta} text-gray-600 whitespace-nowrap flex items-center gap-1`}>
            <Calendar size={12} />
            <span>{dateRange}</span>
          </div>
        )}
      </div>
      {exp.description && (
        <div 
          className={`text-gray-700 ${size.body} leading-relaxed max-w-none prose prose-sm`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(exp.description) }}
        />
      )}
      {exp.highlights && exp.highlights.length > 0 && (
        <ul className={`list-disc list-outside ml-4 ${size.listMt} ${size.meta} text-gray-700 space-y-0.5`}>
          {exp.highlights.map((highlight, idx) => (
            <li key={idx}>{highlight}</li>
          ))}
        </ul>
      )}
      <ExtraProperties 
        data={exp} 
        exclude={['company', 'role', 'location', 'employment_type', 'start_date', 'end_date', 'is_current', 'description', 'highlights']} 
        sizeClass={size.body}
      />
    </div>
  );
};

const renderEducationItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses, presentLabel?: string) => {
  const edu = item.content as EducationContent;
  const dateRange = formatCvDateRange(edu.start_date, edu.end_date, edu.is_current, presentLabel);
  return (
    <div className={`${size.itemMb} break-inside-avoid rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2`}>
      <div className="flex justify-between items-start mb-1.5 gap-4">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-gray-900`}>{edu.degree}</h3>
          <p className={`${size.itemSub} font-semibold`} style={{ color: primaryColor }}>{edu.institution}</p>
          {edu.field_of_study && (
            <p className={`${size.meta} text-gray-600`}>{edu.field_of_study}</p>
          )}
        </div>
        <div className={`text-right ${size.meta} text-gray-600 whitespace-nowrap`}>
          {dateRange && (
            <div className="flex items-center gap-1 justify-end">
              <Calendar size={12} />
              <span>{dateRange}</span>
            </div>
          )}
          {edu.location && <p className="mt-0.5">{edu.location}</p>}
          {edu.gpa && <p className="mt-0.5 font-medium">GPA: {edu.gpa}</p>}
        </div>
      </div>
      {edu.description && (
        <p className={`text-gray-700 ${size.body} leading-relaxed`}>{edu.description}</p>
      )}
      {edu.achievements && edu.achievements.length > 0 && (
        <ul className={`list-disc list-outside ml-4 ${size.listMt} ${size.meta} text-gray-700 space-y-0.5`}>
          {edu.achievements.map((achievement, idx) => (
            <li key={idx}>{achievement}</li>
          ))}
        </ul>
      )}
      <ExtraProperties 
        data={edu} 
        exclude={['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'gpa', 'description', 'achievements']} 
        sizeClass={size.body}
      />
    </div>
  );
};

const renderSkillsGroup = (
  category: string,
  skills: SkillContent[],
  primaryColor: string,
  size: SizeClasses,
  language?: string,
) => {
  return (
    <div className="mb-2 break-inside-avoid rounded-md border border-slate-200 bg-white px-3 py-2">
      {skills.length > 0 && (
        <div className="space-y-1.5">
          <span className={`block font-bold ${size.meta}`} style={{ color: primaryColor }}>
            {category}
          </span>
          <div className="flex flex-wrap gap-1.5 text-gray-700">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className={`${size.meta} inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5`}
              >
                {skill.name}
                {(() => {
                  const normalizedLevel = normalizeSkillLevel(skill.level);
                  return normalizedLevel ? ` · ${getSkillLevelLabel(normalizedLevel, language)}` : '';
                })()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const renderProjectItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
  const project = item.content as ProjectContent;
  const dateRange = formatCvDateRange(project.start_date, project.end_date);
  return (
    <div className={`${size.itemMb} break-inside-avoid rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2`}>
      <div className="flex justify-between items-start mb-1.5 gap-4">
        <div className="flex-1">
          <h3 className={`${size.itemTitle} font-bold text-gray-900`}>{project.name}</h3>
          {project.role && (
            <p className={`${size.meta} text-gray-600`}>{project.role}</p>
          )}
        </div>
        {dateRange && (
          <div className={`${size.meta} text-gray-600 whitespace-nowrap flex items-center gap-1`}>
            <Calendar size={12} />
            <span>{dateRange}</span>
          </div>
        )}
      </div>
      <p className={`text-gray-700 ${size.body} leading-relaxed mb-1.5`}>
        {project.description}
      </p>
      {project.technologies && project.technologies.length > 0 && (
        <div className={`${size.meta} text-gray-600 mb-1.5`}>
          <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
        </div>
      )}
      <div className={`flex flex-wrap gap-3 ${size.meta}`}>
        {project.url && (
          <a href={project.url} className="flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
            <ExternalLink size={12} /> Live Demo
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} className="flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
            <Github size={12} /> GitHub
          </a>
        )}
      </div>
      <ExtraProperties 
        data={project} 
        exclude={['name', 'role', 'start_date', 'end_date', 'description', 'technologies', 'url', 'github_url']} 
        sizeClass={size.body}
      />
    </div>
  );
};

const renderLanguageItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
  const lang = item.content as LanguageContent;
  return (
    <div className="break-inside-avoid rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className={`flex justify-between items-center ${size.meta} gap-2`}>
        <span className="font-semibold text-gray-800 truncate">{lang.name}</span>
        {lang.proficiency && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-gray-700 whitespace-nowrap">
            {lang.proficiency}
          </span>
        )}
      </div>
      <ExtraProperties
        data={lang}
        exclude={['name', 'proficiency', 'certification', 'certificate', 'cert', 'language_certificate', 'languageCertification', 'chung_chi', 'chungChi']}
        sizeClass={size.body}
      />
    </div>
  );
};

const renderCertificationItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
  const cert = item.content as CertificationContent;
  const dateRange = formatCvDateRange(cert.issue_date, cert.expiration_date);

  return (
    <div className="mb-2 break-inside-avoid rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {cert.name && <div className={`${size.itemTitle} font-semibold text-gray-800`}>{cert.name}</div>}
          {cert.issuer && <div className={`${size.meta} text-gray-600`}>{cert.issuer}</div>}
        </div>
        {dateRange && <div className={`${size.meta} whitespace-nowrap text-gray-600`}>{dateRange}</div>}
      </div>

      {(cert.credential_id || cert.credential_url) && (
        <div className={`${size.meta} mt-1 space-y-0.5 text-gray-600`}>
          {cert.credential_id && (
            <div>
              <span className="font-semibold" style={{ color: primaryColor }}>ID: </span>
              <span>{cert.credential_id}</span>
            </div>
          )}
          {cert.credential_url && <div className="break-all">{cert.credential_url}</div>}
        </div>
      )}

      {cert.description && <p className={`${size.body} mt-1.5 text-gray-700`}>{cert.description}</p>}

      <ExtraProperties
        data={cert as Record<string, unknown>}
        exclude={['name', 'issuer', 'issue_date', 'expiration_date', 'credential_id', 'credential_url', 'description']}
        sizeClass={size.body}
      />
    </div>
  );
};

const renderCustomItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
  const custom = item.content as CustomContent;
  const customRecord = custom as Record<string, unknown>;
  const { label, value } = getCustomPrimaryContent(customRecord);
  const extras = getExtraFields(customRecord, ['label', 'value', 'text']);

  if (!label && !value && extras.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 break-inside-avoid">
      {(label || value) && (
        <div className={`flex gap-2 ${size.meta}`}>
          {label && (
            <span className="font-bold min-w-[100px]" style={{ color: primaryColor }}>
              {value ? `${label}:` : label}
            </span>
          )}
          {value && <span className="text-gray-700 flex-1 whitespace-pre-line">{value}</span>}
        </div>
      )}
      {extras.length > 0 && (
        <div className="mt-1 space-y-1">
          {extras.map((extra) => (
            <div key={extra.key} className={size.body}>
              <span className="font-semibold text-gray-700 capitalize">{extra.label}: </span>
              <span className="text-gray-600">{extra.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderGenericItem = (item: CVSectionItem, primaryColor: string, size: SizeClasses) => {
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
    <div className={`${size.itemMb} break-inside-avoid rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2`}>
      {entries.map(([key, value]) => (
        <div key={key} className={`${size.body} text-gray-700 mb-1`}>
          <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}: </span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(formatValue(value)) }} />
        </div>
      ))}
    </div>
  );
};

// Main ModernTemplate Component
type TemplateItem = CVPageEngineItem & { render: () => React.ReactNode };

export const ModernTemplate: React.FC<{ data: CVData; previewMode?: boolean }> = ({ data, previewMode = false }) => {
  const fontFamily = 'system-ui, -apple-system, sans-serif';
  const primaryColor = '#1f2937';
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
          small: 'text-[8px]',
          avatar: 'h-28 w-28',
          headerGap: 'gap-3',
          headerMb: 'mb-3',
          headerPb: 'pb-3',
          summaryMt: 'mt-2',
          sectionSpacer: 'h-2',
          sectionTitleMb: 'mb-2',
          itemMb: 'mb-2.5',
          listMt: 'mt-1',
          metaGapX: 'gap-x-3',
          metaGapY: 'gap-y-1',
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
          avatar: 'h-36 w-36',
          headerGap: 'gap-4',
          headerMb: 'mb-4',
          headerPb: 'pb-4',
          summaryMt: 'mt-2.5',
          sectionSpacer: 'h-3',
          sectionTitleMb: 'mb-3',
          itemMb: 'mb-3',
          listMt: 'mt-1.5',
          metaGapX: 'gap-x-4',
          metaGapY: 'gap-y-1',
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
          headerGap: 'gap-4',
          headerMb: 'mb-3',
          headerPb: 'pb-3',
          summaryMt: 'mt-1.5',
          sectionSpacer: 'h-2',
          sectionTitleMb: 'mb-2',
          itemMb: 'mb-2',
          listMt: 'mt-0.5',
          metaGapX: 'gap-x-3',
          metaGapY: 'gap-y-1',
        };
    }
  }, [fontSizePreset]);

  // Flatten Data logic
  const items: TemplateItem[] = React.useMemo(() => {
    if (!data?.sections) return [];
    
    const result: TemplateItem[] = [];
    
    // Header
    const headerSection = data.sections.find(s => s.section_type === 'header');
    const headerItem = headerSection?.is_visible === false ? undefined : filterRenderableItems(headerSection?.items)[0];
    if (headerItem && headerSection) {
      result.push({
        id: `header-${headerSection.id}`,
        type: 'header',
        render: () => renderHeader(headerItem.content as HeaderContent, primaryColor, sizeClasses)
      });
    }

    // Other Sections
    const otherSections = data.sections.filter(
      (section) => section.section_type !== 'header' && hasRenderableSection(section),
    );
    
    otherSections.forEach(section => {
      const sectionItems = filterRenderableItems(section.items);
      if (sectionItems.length === 0) return;

      // 1. Section Title
      // Add margin top spacer if not first?
      if (result.length > 0) {
        result.push({
          id: `spacer-${section.id}`,
          type: 'spacer',
          render: () => <div className={sizeClasses.sectionSpacer} />
        });
      }

      result.push({
        id: `title-${section.id}`,
        type: 'title',
        render: () => <div>{renderSectionTitle(section.title, primaryColor, sizeClasses)}</div>
      });

      // 2. Section Items
      if (section.section_type === 'skills') {
        const skills = sectionItems.map(item => item.content as SkillContent);
        const groupedSkills = skills.reduce((acc, skill) => {
          const category = skill.category || 'General';
          if (!acc[category]) acc[category] = [];
          acc[category].push(skill);
          return acc;
        }, {} as Record<string, SkillContent[]>);

        Object.entries(groupedSkills).forEach(([category, categorySkills], idx) => {
          result.push({
            id: `skill-group-${section.id}-${idx}`,
            type: 'content',
            render: () => renderSkillsGroup(category, categorySkills, primaryColor, sizeClasses, data.language)
          });
        });
      } else if (section.section_type === 'languages') {
        // Languages Grid
       if (sectionItems.length > 0) {
         // Should we split languages? They are small.
         // Let's render as rows of 2.
         const chunks = [];
         for (let i = 0; i < sectionItems.length; i += 2) {
            chunks.push(sectionItems.slice(i, i + 2));
         }
         chunks.forEach((chunk, idx) => {
           result.push({
             id: `lang-row-${section.id}-${idx}`,
             type: 'content',
             render: () => (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {chunk.map(item => (
                    <div key={item.id}>{renderLanguageItem(item, primaryColor, sizeClasses)}</div>
                  ))}
                </div>
             )
           });
         });
       }
      } else if (section.section_type === 'certifications') {
        sectionItems.forEach((item) => {
          result.push({
            id: `cert-${section.id}-${item.id}`,
            type: 'content',
            render: () => renderCertificationItem(item, primaryColor, sizeClasses),
          });
        });
      } else {
        // Standard List (Experience, Education, Projects, Custom, Generic)
        sectionItems.forEach((item) => {
          let renderItem: (() => React.ReactNode) | null = null;
          if (section.section_type === 'experience') renderItem = () => renderExperienceItem(item, primaryColor, sizeClasses, presentLabel);
          else if (section.section_type === 'education') renderItem = () => renderEducationItem(item, primaryColor, sizeClasses, presentLabel);
          else if (section.section_type === 'projects') renderItem = () => renderProjectItem(item, primaryColor, sizeClasses);
          else if (section.section_type === 'custom') renderItem = () => renderCustomItem(item, primaryColor, sizeClasses);
          else renderItem = () => renderGenericItem(item, primaryColor, sizeClasses);
          
          result.push({
            id: `item-${item.id}`,
            type: 'content',
            render: renderItem
          });
        });
      }
    });

    return result;
  }, [data, primaryColor, sizeClasses, presentLabel]);

  return (
    <div className="modern-template cv-template-root">
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
                fontFamily={fontFamily}
                primaryColor={primaryColor}
                widthMm={210}
                heightMm={297}
                paddingMm={12}
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
