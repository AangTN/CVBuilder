import { describe, expect, it } from 'vitest';
import { filterRenderableItems, hasRenderableContent, hasRenderableSection } from './renderVisibility';

describe('renderVisibility helpers', () => {
  it('detects renderable primitive and nested values', () => {
    expect(hasRenderableContent(' text ')).toBe(true);
    expect(hasRenderableContent('<p> </p>')).toBe(false);
    expect(hasRenderableContent(['', 'React'])).toBe(true);
    expect(hasRenderableContent({ nested: { value: 'ok' } })).toBe(true);
  });

  it('filters out non-renderable items', () => {
    const items = [
      { id: '1', content: { title: 'Visible' } },
      { id: '2', content: { title: '   ' } },
      { id: '3', content: { description: '<p> </p>' } },
    ] as any;

    const filtered = filterRenderableItems(items);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('honors section visibility flag', () => {
    const sectionHidden = {
      id: 'sec-1',
      section_type: 'experience',
      title: 'Experience',
      is_visible: false,
      items: [{ id: 'a', content: { role: 'Dev' } }],
    } as any;

    const sectionVisible = {
      ...sectionHidden,
      id: 'sec-2',
      is_visible: true,
    };

    expect(hasRenderableSection(sectionHidden)).toBe(false);
    expect(hasRenderableSection(sectionVisible)).toBe(true);
  });
});
