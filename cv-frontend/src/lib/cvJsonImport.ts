import { CVData, CVSection, CVSectionItem, SectionType } from '@/lib/types';
import {
  Language,
  getSectionTitle,
  isSupportedLanguage,
  normalizeSectionTitles,
} from '@/lib/sectionTitles';

type JsonObject = Record<string, unknown>;

const SECTION_ORDER: SectionType[] = [
  'header',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'custom',
];

const isObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const asObjectArray = (value: unknown): JsonObject[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject);
};

const asNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseLanguage = (value: unknown): Language => {
  if (typeof value === 'string' && isSupportedLanguage(value)) {
    return value;
  }
  return 'vi';
};

const createId = (prefix: string, index: number): string => {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${index}-${randomPart}`;
};

const isSectionType = (value: unknown): value is SectionType => {
  return typeof value === 'string' && SECTION_ORDER.includes(value as SectionType);
};

const normalizeItem = (
  sectionId: string,
  item: JsonObject,
  index: number,
): CVSectionItem => {
  const rawContent = isObject(item.content) ? item.content : item;
  return {
    id: asString(item.id) || createId(`${sectionId}-item`, index),
    section_id: sectionId,
    content: rawContent,
    position: asNumber(item.position, index),
  };
};

const normalizeSectionItems = (
  sectionId: string,
  sectionType: SectionType,
  rawItems: unknown,
): CVSectionItem[] => {
  const items = asObjectArray(rawItems).map((item, index) => normalizeItem(sectionId, item, index));

  if (items.length > 0) {
    return items;
  }

  if (isObject(rawItems) && sectionType === 'header') {
    return [
      {
        id: createId(`${sectionId}-item`, 0),
        section_id: sectionId,
        content: rawItems,
        position: 0,
      },
    ];
  }

  return [];
};

const normalizeSection = (
  rawSection: JsonObject,
  language: Language,
  index: number,
): CVSection | null => {
  const sectionType = isSectionType(rawSection.section_type) ? rawSection.section_type : null;
  if (!sectionType) return null;

  const sectionId = asString(rawSection.id) || createId(sectionType, index);

  return {
    id: sectionId,
    cv_id: asString(rawSection.cv_id) || 'draft',
    section_type: sectionType,
    title: asString(rawSection.title) || getSectionTitle(sectionType, language),
    is_visible: typeof rawSection.is_visible === 'boolean' ? rawSection.is_visible : true,
    items: normalizeSectionItems(sectionId, sectionType, rawSection.items),
  };
};

const parseFromFullShape = (raw: JsonObject, language: Language): CVSection[] => {
  const sections = asObjectArray(raw.sections)
    .map((section, index) => normalizeSection(section, language, index))
    .filter((section): section is CVSection => section !== null);

  return normalizeSectionTitles(sections, language);
};

const toItemsFromPayload = (payload: unknown): JsonObject[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isObject);
  }
  if (isObject(payload)) {
    return [payload];
  }
  return [];
};

const parseFromFlatShape = (raw: JsonObject, language: Language): CVSection[] => {
  const sections: CVSection[] = [];

  SECTION_ORDER.forEach((sectionType, index) => {
    if (!(sectionType in raw)) return;
    const payload = raw[sectionType];

    if (sectionType === 'custom') {
      const customPayload = Array.isArray(payload) ? payload.filter(isObject) : [];
      if (customPayload.length > 0 && customPayload.some((item) => Array.isArray(item.items))) {
        customPayload.forEach((customSection, customIndex) => {
          const sectionId = asString(customSection.id) || createId('custom', customIndex);
          const items = normalizeSectionItems(sectionId, 'custom', customSection.items);
          sections.push({
            id: sectionId,
            cv_id: 'draft',
            section_type: 'custom',
            title: asString(customSection.title) || `${getSectionTitle('custom', language)} ${customIndex + 1}`,
            is_visible:
              typeof customSection.is_visible === 'boolean' ? customSection.is_visible : true,
            items,
          });
        });
        return;
      }
    }

    const sectionId = createId(sectionType, index);
    const items = toItemsFromPayload(payload).map((item, itemIndex) => ({
      id: asString(item.id) || createId(`${sectionType}-item`, itemIndex),
      section_id: sectionId,
      content: isObject(item.content) ? item.content : item,
      position: asNumber(item.position, itemIndex),
    }));

    sections.push({
      id: sectionId,
      cv_id: 'draft',
      section_type: sectionType,
      title: getSectionTitle(sectionType, language),
      is_visible: true,
      items,
    });
  });

  return sections;
};

export const importCvDataFromJson = (jsonText: string, currentData: CVData): CVData => {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    throw new Error('Vui lòng dán nội dung JSON trước khi import.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.');
  }

  if (!isObject(parsed)) {
    throw new Error('JSON phải là object ở cấp cao nhất.');
  }

  const language = parseLanguage(parsed.language ?? currentData.language);
  const sections = Array.isArray(parsed.sections)
    ? parseFromFullShape(parsed, language)
    : parseFromFlatShape(parsed, language);

  if (sections.length === 0) {
    throw new Error('Không tìm thấy dữ liệu section để tạo CV.');
  }

  return {
    ...currentData,
    template_id: asString(parsed.template_id) || currentData.template_id,
    language,
    settings: {
      ...(currentData.settings || {}),
      ...(isObject(parsed.settings) ? parsed.settings : {}),
    },
    sections,
  };
};
