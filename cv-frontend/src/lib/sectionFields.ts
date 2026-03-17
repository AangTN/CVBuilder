import { SectionType } from './types';

export type Language = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

// Field labels for Header section
export const HEADER_FIELDS: Record<string, Record<Language, string>> = {
  full_name: {
    vi: 'Họ và Tên',
    en: 'Full Name',
    ja: '氏名',
    ko: '이름',
    zh: '姓名',
  },
  title: {
    vi: 'Chức Danh',
    en: 'Job Title',
    ja: '役職',
    ko: '직책',
    zh: '职位',
  },
  email: {
    vi: 'Email',
    en: 'Email',
    ja: 'メール',
    ko: '이메일',
    zh: '邮箱',
  },
  phone: {
    vi: 'Số Điện Thoại',
    en: 'Phone',
    ja: '電話番号',
    ko: '전화번호',
    zh: '电话',
  },
  location: {
    vi: 'Địa Điểm',
    en: 'Location',
    ja: '住所',
    ko: '주소',
    zh: '地址',
  },
  date_of_birth: {
    vi: 'Ngày Sinh',
    en: 'Date of Birth',
    ja: '生年月日',
    ko: '생년월일',
    zh: '出生日期',
  },
  gender: {
    vi: 'Giới Tính',
    en: 'Gender',
    ja: '性別',
    ko: '성별',
    zh: '性别',
  },
  website: {
    vi: 'Website',
    en: 'Website',
    ja: 'ウェブサイト',
    ko: '웹사이트',
    zh: '网站',
  },
  linkedin: {
    vi: 'LinkedIn',
    en: 'LinkedIn',
    ja: 'LinkedIn',
    ko: 'LinkedIn',
    zh: 'LinkedIn',
  },
  github: {
    vi: 'GitHub',
    en: 'GitHub',
    ja: 'GitHub',
    ko: 'GitHub',
    zh: 'GitHub',
  },
  facebook: {
    vi: 'Facebook',
    en: 'Facebook',
    ja: 'Facebook',
    ko: 'Facebook',
    zh: 'Facebook',
  },
  twitter: {
    vi: 'Twitter/X',
    en: 'Twitter/X',
    ja: 'Twitter/X',
    ko: 'Twitter/X',
    zh: 'Twitter/X',
  },
  instagram: {
    vi: 'Instagram',
    en: 'Instagram',
    ja: 'Instagram',
    ko: 'Instagram',
    zh: 'Instagram',
  },
  photo_url: {
    vi: 'Ảnh Đại Diện',
    en: 'Photo URL',
    ja: '写真URL',
    ko: '사진 URL',
    zh: '照片链接',
  },
  summary: {
    vi: 'Giới Thiệu Bản Thân',
    en: 'Summary',
    ja: '自己紹介',
    ko: '소개',
    zh: '个人简介',
  },
};

// Field labels for Experience section
export const EXPERIENCE_FIELDS: Record<string, Record<Language, string>> = {
  company: {
    vi: 'Công Ty',
    en: 'Company',
    ja: '会社名',
    ko: '회사',
    zh: '公司',
  },
  role: {
    vi: 'Vị Trí',
    en: 'Role',
    ja: '役職',
    ko: '직위',
    zh: '职位',
  },
  location: {
    vi: 'Địa Điểm',
    en: 'Location',
    ja: '場所',
    ko: '위치',
    zh: '地点',
  },
  employment_type: {
    vi: 'Hình Thức Làm Việc',
    en: 'Employment Type',
    ja: '雇用形態',
    ko: '고용 형태',
    zh: '工作类型',
  },
  start_date: {
    vi: 'Ngày Bắt Đầu',
    en: 'Start Date',
    ja: '開始日',
    ko: '시작일',
    zh: '开始日期',
  },
  end_date: {
    vi: 'Ngày Kết Thúc',
    en: 'End Date',
    ja: '終了日',
    ko: '종료일',
    zh: '结束日期',
  },
  is_current: {
    vi: 'Đang Làm Việc',
    en: 'Currently Working',
    ja: '現在勤務中',
    ko: '현재 근무 중',
    zh: '目前在职',
  },
  description: {
    vi: 'Mô Tả Công Việc',
    en: 'Description',
    ja: '業務内容',
    ko: '업무 설명',
    zh: '工作描述',
  },
  highlights: {
    vi: 'Thành Tựu Nổi Bật',
    en: 'Highlights',
    ja: '主な実績',
    ko: '주요 성과',
    zh: '主要成就',
  },
};

// Field labels for Education section
export const EDUCATION_FIELDS: Record<string, Record<Language, string>> = {
  institution: {
    vi: 'Trường',
    en: 'Institution',
    ja: '学校名',
    ko: '학교',
    zh: '学校',
  },
  degree: {
    vi: 'Bằng Cấp',
    en: 'Degree',
    ja: '学位',
    ko: '학위',
    zh: '学位',
  },
  field_of_study: {
    vi: 'Chuyên Ngành',
    en: 'Field of Study',
    ja: '専攻',
    ko: '전공',
    zh: '专业',
  },
  location: {
    vi: 'Địa Điểm',
    en: 'Location',
    ja: '場所',
    ko: '위치',
    zh: '地点',
  },
  start_date: {
    vi: 'Ngày Bắt Đầu',
    en: 'Start Date',
    ja: '入学日',
    ko: '시작일',
    zh: '开始日期',
  },
  end_date: {
    vi: 'Ngày Kết Thúc',
    en: 'End Date',
    ja: '卒業日',
    ko: '종료일',
    zh: '结束日期',
  },
  is_current: {
    vi: 'Đang Theo Học',
    en: 'Currently Studying',
    ja: '在学中',
    ko: '재학 중',
    zh: '在读',
  },
  gpa: {
    vi: 'Điểm GPA',
    en: 'GPA',
    ja: 'GPA',
    ko: 'GPA',
    zh: 'GPA',
  },
  description: {
    vi: 'Mô Tả',
    en: 'Description',
    ja: '説明',
    ko: '설명',
    zh: '描述',
  },
  achievements: {
    vi: 'Thành Tích',
    en: 'Achievements',
    ja: '実績',
    ko: '성취',
    zh: '成就',
  },
};

// Field labels for Skills section
export const SKILL_FIELDS: Record<string, Record<Language, string>> = {
  name: {
    vi: 'Tên Kỹ Năng',
    en: 'Skill Name',
    ja: 'スキル名',
    ko: '기술 이름',
    zh: '技能名称',
  },
  level: {
    vi: 'Trình Độ',
    en: 'Level',
    ja: 'レベル',
    ko: '수준',
    zh: '水平',
  },
  category: {
    vi: 'Danh Mục',
    en: 'Category',
    ja: 'カテゴリー',
    ko: '카테고리',
    zh: '类别',
  },
};

// Field labels for Projects section
export const PROJECT_FIELDS: Record<string, Record<Language, string>> = {
  name: {
    vi: 'Tên Dự Án',
    en: 'Project Name',
    ja: 'プロジェクト名',
    ko: '프로젝트 이름',
    zh: '项目名称',
  },
  role: {
    vi: 'Vai Trò',
    en: 'Role',
    ja: '役割',
    ko: '역할',
    zh: '角色',
  },
  start_date: {
    vi: 'Ngày Bắt Đầu',
    en: 'Start Date',
    ja: '開始日',
    ko: '시작일',
    zh: '开始日期',
  },
  end_date: {
    vi: 'Ngày Kết Thúc',
    en: 'End Date',
    ja: '終了日',
    ko: '종료일',
    zh: '结束日期',
  },
  description: {
    vi: 'Mô Tả',
    en: 'Description',
    ja: '説明',
    ko: '설명',
    zh: '描述',
  },
  technologies: {
    vi: 'Công Nghệ',
    en: 'Technologies',
    ja: '技術',
    ko: '기술',
    zh: '技术',
  },
  url: {
    vi: 'Link Dự Án',
    en: 'Project URL',
    ja: 'プロジェクトURL',
    ko: '프로젝트 URL',
    zh: '项目链接',
  },
  github_url: {
    vi: 'GitHub URL',
    en: 'GitHub URL',
    ja: 'GitHub URL',
    ko: 'GitHub URL',
    zh: 'GitHub链接',
  },
};

// Field labels for Languages section
export const LANGUAGE_FIELDS: Record<string, Record<Language, string>> = {
  name: {
    vi: 'Ngôn Ngữ',
    en: 'Language',
    ja: '言語',
    ko: '언어',
    zh: '语言',
  },
  proficiency: {
    vi: 'Trình Độ',
    en: 'Proficiency',
    ja: '習熟度',
    ko: '숙련도',
    zh: '熟练度',
  },
};

// Field labels for Certifications section
export const CERTIFICATION_FIELDS: Record<string, Record<Language, string>> = {
  name: {
    vi: 'Tên Chứng Chỉ',
    en: 'Certification Name',
    ja: '資格・認定名',
    ko: '자격증명',
    zh: '证书名称',
  },
  issuer: {
    vi: 'Đơn Vị Cấp',
    en: 'Issuing Organization',
    ja: '発行機関',
    ko: '발급 기관',
    zh: '颁发机构',
  },
  issue_date: {
    vi: 'Ngày Cấp',
    en: 'Issue Date',
    ja: '取得日',
    ko: '취득일',
    zh: '获取日期',
  },
  expiration_date: {
    vi: 'Ngày Hết Hạn',
    en: 'Expiration Date',
    ja: '有効期限',
    ko: '만료일',
    zh: '到期日期',
  },
  credential_id: {
    vi: 'Mã Chứng Chỉ',
    en: 'Credential ID',
    ja: '資格ID',
    ko: '자격증 ID',
    zh: '证书编号',
  },
  credential_url: {
    vi: 'Đường Dẫn Xác Minh',
    en: 'Credential URL',
    ja: '認証URL',
    ko: '인증 URL',
    zh: '证书链接',
  },
  description: {
    vi: 'Mô Tả',
    en: 'Description',
    ja: '説明',
    ko: '설명',
    zh: '描述',
  },
};

// Field labels for Custom section
export const CUSTOM_FIELDS: Record<string, Record<Language, string>> = {
  label: {
    vi: 'Nhãn',
    en: 'Label',
    ja: 'ラベル',
    ko: '라벨',
    zh: '标签',
  },
  value: {
    vi: 'Giá Trị',
    en: 'Value',
    ja: '値',
    ko: '값',
    zh: '值',
  },
};

// Map section type to its field labels
const SECTION_FIELDS_MAP: Record<SectionType, Record<string, Record<Language, string>>> = {
  header: HEADER_FIELDS,
  experience: EXPERIENCE_FIELDS,
  education: EDUCATION_FIELDS,
  skills: SKILL_FIELDS,
  projects: PROJECT_FIELDS,
  certifications: CERTIFICATION_FIELDS,
  languages: LANGUAGE_FIELDS,
  custom: CUSTOM_FIELDS,
};

/**
 * Get field label by section type, field name, and language
 * @param sectionType - The type of the section
 * @param fieldName - The name of the field
 * @param language - The language code (default: 'vi')
 * @returns The translated field label
 */
export function getFieldLabel(
  sectionType: SectionType,
  fieldName: string,
  language: Language = 'vi'
): string {
  const sectionFields = SECTION_FIELDS_MAP[sectionType];
  if (!sectionFields) return fieldName;
  
  const fieldLabels = sectionFields[fieldName];
  if (!fieldLabels) return fieldName;
  
  return fieldLabels[language] || fieldLabels.en || fieldName;
}

/**
 * Get all field labels for a section type
 * @param sectionType - The type of the section
 * @param language - The language code (default: 'vi')
 * @returns Object with field names as keys and translated labels as values
 */
export function getSectionFields(
  sectionType: SectionType,
  language: Language = 'vi'
): Record<string, string> {
  const sectionFields = SECTION_FIELDS_MAP[sectionType];
  if (!sectionFields) return {};
  
  const result: Record<string, string> = {};
  for (const [fieldName, translations] of Object.entries(sectionFields)) {
    result[fieldName] = translations[language] || translations.en || fieldName;
  }
  
  return result;
}

/**
 * Get field placeholder text
 * @param sectionType - The type of the section
 * @param fieldName - The name of the field
 * @param language - The language code (default: 'vi')
 * @returns The placeholder text for the field
 */
export function getFieldPlaceholder(
  sectionType: SectionType,
  fieldName: string,
  language: Language = 'vi'
): string {
  const placeholders: Record<Language, Record<string, string>> = {
    vi: {
      full_name: 'Ví dụ: Nguyễn Văn A',
      email: 'example@email.com',
      phone: '+84 123 456 789',
      website: 'https://myportfolio.com',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      facebook: 'https://facebook.com/username',
      twitter: 'https://x.com/username',
      instagram: 'https://instagram.com/username',
      date_of_birth: 'dd/mm/yyyy hoặc yyyy-mm-dd',
      start_date: 'mm/yyyy hoặc yyyy-mm',
      end_date: 'mm/yyyy hoặc yyyy-mm',
      company: 'Ví dụ: Công ty ABC',
      role: 'Ví dụ: Senior Developer',
      employment_type: 'Ví dụ: Toàn thời gian',
      institution: 'Ví dụ: Đại học Bách Khoa',
      issuer: 'Ví dụ: Coursera',
      name: 'Ví dụ: JavaScript',
      credential_id: 'Ví dụ: ABC-123-XYZ',
      credential_url: 'https://www.credly.com/badges/abc',
      description: 'Nhập mô tả chi tiết...',
    },
    en: {
      full_name: 'e.g., John Doe',
      email: 'example@email.com',
      phone: '+1 234 567 8900',
      website: 'https://myportfolio.com',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      facebook: 'https://facebook.com/username',
      twitter: 'https://x.com/username',
      instagram: 'https://instagram.com/username',
      date_of_birth: 'dd/mm/yyyy or yyyy-mm-dd',
      start_date: 'mm/yyyy or yyyy-mm',
      end_date: 'mm/yyyy or yyyy-mm',
      company: 'e.g., ABC Company',
      role: 'e.g., Senior Developer',
      employment_type: 'e.g., Full-time',
      institution: 'e.g., University of Technology',
      issuer: 'e.g., Coursera',
      name: 'e.g., JavaScript',
      credential_id: 'e.g., ABC-123-XYZ',
      credential_url: 'https://www.credly.com/badges/abc',
      description: 'Enter detailed description...',
    },
    ja: {
      full_name: '例: 山田太郎',
      email: 'example@email.com',
      phone: '+81 90-1234-5678',
      website: 'https://myportfolio.com',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      facebook: 'https://facebook.com/username',
      twitter: 'https://x.com/username',
      instagram: 'https://instagram.com/username',
      date_of_birth: 'dd/mm/yyyy または yyyy-mm-dd',
      start_date: 'mm/yyyy または yyyy-mm',
      end_date: 'mm/yyyy または yyyy-mm',
      company: '例: ABC株式会社',
      role: '例: シニアデベロッパー',
      employment_type: '例: 正社員',
      institution: '例: 工科大学',
      issuer: '例: Coursera',
      name: '例: JavaScript',
      credential_id: '例: ABC-123-XYZ',
      credential_url: 'https://www.credly.com/badges/abc',
      description: '詳細を入力してください...',
    },
    ko: {
      full_name: '예: 홍길동',
      email: 'example@email.com',
      phone: '+82 10-1234-5678',
      website: 'https://myportfolio.com',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      facebook: 'https://facebook.com/username',
      twitter: 'https://x.com/username',
      instagram: 'https://instagram.com/username',
      date_of_birth: 'dd/mm/yyyy 또는 yyyy-mm-dd',
      start_date: 'mm/yyyy 또는 yyyy-mm',
      end_date: 'mm/yyyy 또는 yyyy-mm',
      company: '예: ABC 회사',
      role: '예: 시니어 개발자',
      employment_type: '예: 정규직',
      institution: '예: 공과대학교',
      issuer: '예: Coursera',
      name: '예: JavaScript',
      credential_id: '예: ABC-123-XYZ',
      credential_url: 'https://www.credly.com/badges/abc',
      description: '상세 설명을 입력하세요...',
    },
    zh: {
      full_name: '例如：张三',
      email: 'example@email.com',
      phone: '+86 138 0000 0000',
      website: 'https://myportfolio.com',
      linkedin: 'https://linkedin.com/in/username',
      github: 'https://github.com/username',
      facebook: 'https://facebook.com/username',
      twitter: 'https://x.com/username',
      instagram: 'https://instagram.com/username',
      date_of_birth: 'dd/mm/yyyy 或 yyyy-mm-dd',
      start_date: 'mm/yyyy 或 yyyy-mm',
      end_date: 'mm/yyyy 或 yyyy-mm',
      company: '例如：ABC公司',
      role: '例如：高级开发工程师',
      employment_type: '例如：全职',
      institution: '例如：理工大学',
      issuer: '例如：Coursera',
      name: '例如：JavaScript',
      credential_id: '例如：ABC-123-XYZ',
      credential_url: 'https://www.credly.com/badges/abc',
      description: '请输入详细描述...',
    },
  };
  
  return placeholders[language]?.[fieldName] || '';
}
