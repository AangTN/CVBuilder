import { describe, expect, it } from 'vitest';
import { normalizeFontSizePreset } from './fontSizePreset';

describe('normalizeFontSizePreset', () => {
  it('returns valid presets as-is', () => {
    expect(normalizeFontSizePreset('small')).toBe('small');
    expect(normalizeFontSizePreset('medium')).toBe('medium');
    expect(normalizeFontSizePreset('large')).toBe('large');
  });

  it('falls back to medium for invalid values', () => {
    expect(normalizeFontSizePreset(undefined)).toBe('medium');
    expect(normalizeFontSizePreset('x-large')).toBe('medium');
    expect(normalizeFontSizePreset(123)).toBe('medium');
  });

  it('supports custom fallback', () => {
    expect(normalizeFontSizePreset(undefined, 'small')).toBe('small');
    expect(normalizeFontSizePreset('invalid', 'large')).toBe('large');
  });
});
