import type { CVSection, SectionType } from './types';

export type Language = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

export const SECTION_TITLES: Record<SectionType, Record<Language, string>> = {
  header: {
    vi: 'Thông Tin Cá Nhân',
    en: 'Personal Information',
    ja: '個人情報',
    ko: '개인 정보',
    zh: '个人信息',
  },
  experience: {
    vi: 'Kinh Nghiệm Làm Việc',
    en: 'Work Experience',
    ja: '職務経歴',
    ko: '경력',
    zh: '工作经历',
  },
  education: {
    vi: 'Học Vấn',
    en: 'Education',
    ja: '学歴',
    ko: '학력',
    zh: '教育背景',
  },
  skills: {
    vi: 'Kỹ Năng',
    en: 'Skills',
    ja: 'スキル',
    ko: '기술',
    zh: '技能',
  },
  projects: {
    vi: 'Dự Án',
    en: 'Projects',
    ja: 'プロジェクト',
    ko: '프로젝트',
    zh: '项目经验',
  },
  certifications: {
    vi: 'Chứng Chỉ',
    en: 'Certifications',
    ja: '資格・認定',
    ko: '자격증',
    zh: '证书与认证',
  },
  languages: {
    vi: 'Ngôn Ngữ',
    en: 'Languages',
    ja: '言語',
    ko: '언어',
    zh: '语言能力',
  },
  custom: {
    vi: 'Thông Tin Bổ Sung',
    en: 'Additional Information',
    ja: '追加情報',
    ko: '추가 정보',
    zh: '补充信息',
  },
};

/**
 * Get section title by section type and language
 * @param sectionType - The type of the section
 * @param language - The language code (default: 'vi')
 * @returns The translated section title
 */
export function getSectionTitle(sectionType: SectionType, language: Language = 'vi'): string {
  return SECTION_TITLES[sectionType]?.[language] || SECTION_TITLES[sectionType]?.en || sectionType;
}

/**
 * Get all available languages
 * @returns Array of language codes
 */
export function getAvailableLanguages(): Language[] {
  return ['vi', 'en', 'ja', 'ko', 'zh'];
}

export function isSupportedLanguage(language: string | undefined | null): language is Language {
  if (!language) return false;
  return getAvailableLanguages().includes(language as Language);
}

const normalizeTitle = (value?: string) => value?.trim().toLowerCase() ?? '';

export function inferLanguageFromSections(sections: CVSection[]): Language | undefined {
  const scores: Record<Language, number> = {
    vi: 0,
    en: 0,
    ja: 0,
    ko: 0,
    zh: 0,
  };

  sections.forEach((section) => {
    if (section.section_type === 'custom') return;
    const titles = SECTION_TITLES[section.section_type];
    if (!titles) return;
    const current = normalizeTitle(section.title);
    (Object.keys(titles) as Language[]).forEach((lang) => {
      if (current && normalizeTitle(titles[lang]) === current) {
        scores[lang] += 1;
      }
    });
  });

  const [bestLanguage, bestScore] = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0] as [Language, number];

  return bestScore > 0 ? bestLanguage : undefined;
}

export function normalizeSectionTitles(sections: CVSection[], language: Language): CVSection[] {
  return sections.map((section) => {
    if (section.section_type === 'custom') {
      return section;
    }
    return {
      ...section,
      title: getSectionTitle(section.section_type, language),
    };
  });
}

/**
 * Get language display name
 * @param language - The language code
 * @returns The display name of the language
 */
export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    zh: '中文',
  };
  return names[language] || language;
}
