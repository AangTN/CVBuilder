export type FontSizePreset = 'small' | 'medium' | 'large';

export const normalizeFontSizePreset = (
  value: unknown,
  fallback: FontSizePreset = 'medium',
): FontSizePreset => {
  if (value === 'small' || value === 'medium' || value === 'large') {
    return value;
  }
  return fallback;
};
