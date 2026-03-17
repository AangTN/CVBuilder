import { hasRenderableContent } from './renderVisibility';

const toLabel = (key: string): string => key.replace(/_/g, ' ');

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => hasRenderableContent(item))
      .map((item) => stringifyValue(item))
      .filter((item) => item.trim().length > 0)
      .join(', ');
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return '';
};

export interface ExtraFieldEntry {
  key: string;
  label: string;
  value: string;
}

export interface CustomPrimaryContent {
  label: string;
  value: string;
}

export const getCustomPrimaryContent = (
  content: Record<string, unknown>,
): CustomPrimaryContent => {
  const label = typeof content.label === 'string' ? content.label.trim() : '';
  const value =
    stringifyValue(content.value).trim() ||
    stringifyValue(content.text).trim();

  return {
    label,
    value,
  };
};

export const getExtraFields = (
  content: Record<string, unknown>,
  exclude: string[],
): ExtraFieldEntry[] => {
  return Object.entries(content)
    .filter(([key, value]) => !exclude.includes(key) && hasRenderableContent(value))
    .map(([key, value]) => ({
      key,
      label: toLabel(key),
      value: stringifyValue(value),
    }))
    .filter((entry) => entry.value.trim().length > 0);
};
