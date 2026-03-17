// CV Data Types based on database schema

export type SectionType = 
  | 'header' 
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'projects' 
  | 'certifications'
  | 'languages' 
  | 'custom';

export interface CVSectionItem {
  id: string;
  section_id: string;
  content: Record<string, unknown>; // JSONB content
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CVSection {
  id: string;
  cv_id: string;
  section_type: SectionType;
  title: string;
  is_visible?: boolean;
  items: CVSectionItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CVSettings {
  fontFamily?: string;
  fontSize?: string;
  primaryColor?: string;
  secondaryColor?: string;
  spacing?: string;
  [key: string]: unknown;
}

export interface CVData {
  id?: string;
  user_id?: string;
  name?: string;
  template_id: string;
  language?: string;
  settings?: CVSettings;
  sections: CVSection[];
  created_at?: string;
  updated_at?: string;
}

// Content type definitions for specific section types
export interface HeaderContent {
  full_name: string;
  title: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  photo_url?: string;
  summary?: string;
  [key: string]: unknown;
}

export interface ExperienceContent {
  company: string;
  role: string;
  location?: string;
  employment_type?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description: string; // Can contain HTML
  highlights?: string[];
  [key: string]: unknown;
}

export interface EducationContent {
  institution: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  gpa?: string;
  description?: string;
  achievements?: string[];
  [key: string]: unknown;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillContent {
  name: string;
  level?: SkillLevel;
  category?: string;
  [key: string]: unknown;
}

export interface SkillGroupContent {
  group_name: string;
  skills: {
    name: string;
    level?: SkillLevel;
    icon?: string;
  }[];
  [key: string]: unknown;
}

export interface ProjectContent {
  name: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  description: string;
  technologies?: string[];
  url?: string;
  github_url?: string;
  [key: string]: unknown;
}

export interface LanguageContent {
  name: string;
  proficiency: string;
  [key: string]: unknown;
}

export interface CertificationContent {
  name: string;
  issuer?: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  [key: string]: unknown;
}

export interface CustomContent {
  label?: string;
  value?: string;
  text?: string;
  [key: string]: unknown;
}

export const SKILL_LEVEL_VALUES: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SKILL_LEVEL_LABELS: Record<SkillLevel, { en: string; vi: string; ja: string; ko: string; zh: string }> = {
  Beginner: { en: 'Beginner', vi: 'Cơ bản', ja: '初級', ko: '초급', zh: '初级' },
  Intermediate: { en: 'Intermediate', vi: 'Trung cấp', ja: '中級', ko: '중급', zh: '中级' },
  Advanced: { en: 'Advanced', vi: 'Nâng cao', ja: '上級', ko: '고급', zh: '高级' },
  Expert: { en: 'Expert', vi: 'Chuyên gia', ja: 'エキスパート', ko: '전문가', zh: '专家' },
};

const normalizeSkillLevelToken = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
};

const SKILL_LEVEL_ALIASES: Record<string, SkillLevel> = {
  beginner: 'Beginner',
  beg: 'Beginner',
  basic: 'Beginner',
  'co ban': 'Beginner',
  '初級': 'Beginner',
  '초급': 'Beginner',
  '初级': 'Beginner',

  intermediate: 'Intermediate',
  inter: 'Intermediate',
  'trung cap': 'Intermediate',
  '中級': 'Intermediate',
  '중급': 'Intermediate',
  '中级': 'Intermediate',

  advanced: 'Advanced',
  adv: 'Advanced',
  'nang cao': 'Advanced',
  '上級': 'Advanced',
  '고급': 'Advanced',
  '高级': 'Advanced',

  expert: 'Expert',
  exper: 'Expert',
  exp: 'Expert',
  pro: 'Expert',
  'chuyen gia': 'Expert',
  'エキスパート': 'Expert',
  '전문가': 'Expert',
  '专家': 'Expert',
};

export const normalizeSkillLevel = (value: unknown): SkillLevel | undefined => {
  if (typeof value !== 'string') return undefined;

  const token = normalizeSkillLevelToken(value);
  const alias = SKILL_LEVEL_ALIASES[token];
  if (alias) return alias;

  if (token.startsWith('beg')) return 'Beginner';
  if (token.startsWith('int') || token.startsWith('inter')) return 'Intermediate';
  if (token.startsWith('adv')) return 'Advanced';
  if (token.startsWith('exp') || token.startsWith('expert') || token.startsWith('exper')) return 'Expert';

  return undefined;
};

export const isSkillLevel = (value: unknown): value is SkillLevel => {
  return normalizeSkillLevel(value) !== undefined;
};

export const getSkillLevelLabel = (
  level: SkillLevel,
  language?: string,
): string => {
  const normalizedLanguage = (language || 'en').toLowerCase();
  const locale = normalizedLanguage.startsWith('vi')
    ? 'vi'
    : normalizedLanguage.startsWith('ja')
      ? 'ja'
      : normalizedLanguage.startsWith('ko')
        ? 'ko'
        : normalizedLanguage.startsWith('zh')
          ? 'zh'
          : 'en';
  return SKILL_LEVEL_LABELS[level][locale];
};
