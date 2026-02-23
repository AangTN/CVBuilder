import { describe, expect, it } from 'vitest';
import { buildDraftStorageKey } from './useEditorAutosave';

describe('buildDraftStorageKey', () => {
  it('scopes draft key by user, route and template', () => {
    const key = buildDraftStorageKey('user-123', '/editor', 'tpl-1');
    expect(key).toBe('cv_draft:user-123:/editor:tpl-1');
  });

  it('uses guest fallback when user is missing', () => {
    const key = buildDraftStorageKey(undefined, '/editor', 'tpl-1');
    expect(key).toBe('cv_draft:guest:/editor:tpl-1');
  });
});
