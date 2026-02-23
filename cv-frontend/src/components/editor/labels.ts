import { Language } from '@/lib/sectionTitles';

const PRESENT_LABELS: Record<Language, string> = {
  vi: 'Hiện tại',
  en: 'Present',
  ja: '現在',
  ko: '현재',
  zh: '至今',
};

const CONTACT_LABELS: Record<Language, string> = {
  vi: 'Liên Hệ',
  en: 'Contact',
  ja: '連絡先',
  ko: '연락처',
  zh: '联系方式',
};

export const getPresentLabel = (language: Language) => PRESENT_LABELS[language] || PRESENT_LABELS.en;

export const getContactLabel = (language: Language) => CONTACT_LABELS[language] || CONTACT_LABELS.en;