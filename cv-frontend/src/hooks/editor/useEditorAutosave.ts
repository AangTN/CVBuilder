'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CVData } from '@/lib/types';
import {
  Language,
  inferLanguageFromSections,
  isSupportedLanguage,
  normalizeSectionTitles,
} from '@/lib/sectionTitles';
import { getContactLabel, getPresentLabel } from '@/components/editor/labels';
import { getTemplate } from '@/templates/registry';
import { MODERN_SAMPLE_DATA } from '@/templates/sampleData';

interface LocalDraftPayload {
  cvData: CVData;
  lastSaved?: string;
}

interface UseEditorAutosaveParams {
  templateId: string;
  cvData: CVData;
  userId?: string | null;
  isDraftDirty: boolean;
  setIsDraftDirty: (value: boolean) => void;
  setCvData: (data: CVData, addToHistory?: boolean) => void;
  resetHistory: (newState: CVData) => void;
}

export const buildDraftStorageKey = (
  userId: string | null | undefined,
  routePath: string,
  templateId: string,
) => `cv_draft:${userId || 'guest'}:${routePath}:${templateId}`;

const normalizeCv = (data: CVData): CVData => {
  const safeSections = Array.isArray(data.sections) ? data.sections : [];

  const resolvedLanguage = isSupportedLanguage(data.language)
    ? data.language
    : (inferLanguageFromSections(safeSections) || 'vi');

  return {
    ...data,
    language: resolvedLanguage,
    sections: normalizeSectionTitles(
      safeSections.map((section) => ({
        ...section,
        items: Array.isArray(section.items) ? section.items : [],
      })),
      resolvedLanguage,
    ),
    settings: {
      ...data.settings,
      labels: {
        ...(data.settings?.labels || {}),
        present: getPresentLabel(resolvedLanguage as Language),
        contact: getContactLabel(resolvedLanguage as Language),
      },
    },
  };
};

export function useEditorAutosave({
  templateId,
  cvData,
  userId,
  isDraftDirty,
  setIsDraftDirty,
  setCvData,
  resetHistory,
}: UseEditorAutosaveParams) {
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const isInitialMount = useRef(true);
  const initializedTemplateRef = useRef<string | null>(null);
  const RESTORE_TOAST_ID = 'restore-draft-toast';
  const routePath =
    typeof window !== 'undefined' ? window.location.pathname : '/editor';
  const draftStorageKey = buildDraftStorageKey(userId, routePath, templateId);

  useEffect(() => {
    if (initializedTemplateRef.current === templateId) {
      return;
    }
    initializedTemplateRef.current = templateId;

    const loadCV = () => {
      const savedDraft = localStorage.getItem(draftStorageKey);

      // Always load template sample data first
      const templateData = getTemplate(templateId);
      const freshData = normalizeCv(templateData?.sampleData || MODERN_SAMPLE_DATA);
      setCvData(freshData, false);
      resetHistory(freshData);
      setLastSaved(undefined);
      setIsDraftDirty(false);

      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft) as LocalDraftPayload;
          const hasDraftData = parsedDraft?.cvData && Array.isArray(parsedDraft.cvData.sections);
          if (!hasDraftData) {
            localStorage.removeItem(draftStorageKey);
            return;
          }

          // Ask user before overwriting template data with old draft
          toast.dismiss(RESTORE_TOAST_ID);
          toast('Phát hiện bản nháp chưa lưu', {
            id: RESTORE_TOAST_ID,
            description: 'Bạn có muốn tiếp tục chỉnh sửa bản nháp cũ không?',
            duration: Infinity,
            action: {
              label: 'Khôi phục nháp',
              onClick: () => {
                try {
                  const restoredData = normalizeCv({
                    ...parsedDraft.cvData,
                    template_id: templateId,
                  });
                  setCvData(restoredData, false);
                  resetHistory(restoredData);
                  setLastSaved(
                    parsedDraft.lastSaved ? new Date(parsedDraft.lastSaved) : undefined,
                  );
                  setIsDraftDirty(false);
                  localStorage.removeItem(draftStorageKey);
                  toast.dismiss(RESTORE_TOAST_ID);
                  toast.success('Đã khôi phục bản nháp');
                } catch (err) {
                  console.error('Error restoring draft:', err);
                  localStorage.removeItem(draftStorageKey);
                  toast.dismiss(RESTORE_TOAST_ID);
                  toast.error('Không thể khôi phục bản nháp');
                }
              },
            },
            cancel: {
              label: 'Dùng mẫu mới',
              onClick: () => {
                localStorage.removeItem(draftStorageKey);
                toast.dismiss(RESTORE_TOAST_ID);
                toast.info('Đã xóa bản nháp cũ');
              },
            },
          });
        } catch (error) {
          console.error('Error parsing localStorage draft:', error);
          localStorage.removeItem(draftStorageKey);
        }
      }
    };

    loadCV();

    return () => {
      toast.dismiss(RESTORE_TOAST_ID);
    };
  }, [templateId, resetHistory, setCvData, setIsDraftDirty, draftStorageKey]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isDraftDirty) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const dataToSave: LocalDraftPayload = {
          cvData,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(draftStorageKey, JSON.stringify(dataToSave));
        setLastSaved(new Date());
        setIsDraftDirty(false);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [cvData, isDraftDirty, setIsDraftDirty, draftStorageKey]);

  const clearDraft = () => {
    localStorage.removeItem(draftStorageKey);
  };

  return {
    lastSaved,
    clearDraft,
  };
}
