'use client';

import { useCallback } from 'react';
import { CVData } from '@/lib/types';
import { AIChatOperation } from '@/lib/aiTypes';

const toSectionItems = (
  items: unknown[],
  sectionId: string,
): CVData['sections'][number]['items'] => {
  const normalizedItems: CVData['sections'][number]['items'] = [];

  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      return;
    }

    const raw = item as Record<string, unknown>;
    const rawContent = raw.content;
    const content =
      typeof rawContent === 'object' && rawContent !== null
        ? (rawContent as Record<string, unknown>)
        : raw;

    const rawPosition = raw.position;
    const position = typeof rawPosition === 'number' ? rawPosition : index;

    normalizedItems.push({
      id: typeof raw.id === 'string' ? raw.id : `ai-${Date.now()}-${index}`,
      section_id: sectionId,
      content,
      position,
    });
  });

  return normalizedItems;
};

interface UseEditorAIParams {
  cvData: CVData;
  setCvData: (data: CVData, addToHistory?: boolean) => void;
  setIsDraftDirty: (value: boolean) => void;
}

export function useEditorAI({ cvData, setCvData, setIsDraftDirty }: UseEditorAIParams) {
  const applyAIChatOperations = useCallback(
    (operations: AIChatOperation[]) => {
      if (!operations.length) {
        return;
      }

      const updatedSections = cvData.sections.map((section) => ({
        ...section,
        items: [...section.items],
      }));

      operations.forEach((operation) => {
        const sectionIndex = updatedSections.findIndex(
          (section) =>
            section.section_type === operation.section ||
            section.id === operation.section,
        );

        if (sectionIndex === -1) {
          return;
        }

        const section = updatedSections[sectionIndex];

        if (operation.op === 'add_item' && operation.data) {
          const newItem: CVData['sections'][number]['items'][number] = {
            id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            section_id: section.id,
            content: operation.data,
            position: section.items.length,
          };
          section.items = [...section.items, newItem];
        }

        if (operation.op === 'remove_item' && operation.path) {
          const itemIndex = Number(operation.path);
          if (!Number.isNaN(itemIndex)) {
            section.items = section.items.filter((_, index) => index !== itemIndex);
          }
        }

        if (operation.op === 'update_field' && operation.path && operation.data) {
          const itemIndex = Number(operation.path.split('.')[0]);
          const fieldKey = operation.path.split('.').slice(1).join('.');

          if (!Number.isNaN(itemIndex) && section.items[itemIndex] && fieldKey) {
            const item = section.items[itemIndex];
            section.items[itemIndex] = {
              ...item,
              content: {
                ...item.content,
                [fieldKey]:
                  (operation.data as Record<string, unknown>).value ?? operation.data,
              },
            };
          }
        }

        if (
          (operation.op === 'rewrite_section' ||
            operation.op === 'translate_section') &&
          operation.data &&
          typeof operation.data === 'object'
        ) {
          const sectionData = operation.data as Record<string, unknown>;

          if (typeof sectionData.title === 'string') {
            section.title = sectionData.title;
          }

          if (Array.isArray(sectionData.items)) {
            section.items = toSectionItems(sectionData.items, section.id);
          }
        }
      });

      setCvData(
        {
          ...cvData,
          sections: updatedSections,
        },
        true,
      );
      setIsDraftDirty(true);
    },
    [cvData, setCvData, setIsDraftDirty],
  );

  return {
    applyAIChatOperations,
  };
}
