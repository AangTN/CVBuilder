import { CVSection, CVSectionItem } from '@/lib/types';

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, '').trim();

export const hasRenderableContent = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return stripHtml(value).length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasRenderableContent(item));
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some((item) =>
      hasRenderableContent(item),
    );
  }

  return false;
};

export const filterRenderableItems = (
  items: CVSectionItem[] | undefined,
): CVSectionItem[] => {
  if (!items || items.length === 0) {
    return [];
  }

  return items.filter((item) => hasRenderableContent(item.content));
};

export const hasRenderableSection = (section: CVSection): boolean => {
  if (section.is_visible === false) {
    return false;
  }
  return filterRenderableItems(section.items).length > 0;
};
