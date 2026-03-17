'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CVData, CVSection, CVSectionItem } from '@/lib/types';
import { Language, inferLanguageFromSections, isSupportedLanguage, normalizeSectionTitles } from '@/lib/sectionTitles';
import { getContactLabel, getPresentLabel } from '@/components/editor/labels';
import { getTemplate } from '@/templates/registry';
import { EditorTopBar } from '@/components/editor/EditorTopBar';
import { CVInputPanel } from '@/components/editor/CVInputPanel';
import { CVPreviewPanel } from '@/components/editor/CVPreviewPanel';
import { TemplatePreviewModal } from '@/components/editor/TemplatePreviewModal';
import { AIAssistantPanel } from '@/components/editor/ai/AIAssistantPanel';
import { MODERN_SAMPLE_DATA } from '@/templates/sampleData';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/features/api';
import { useHistory } from '@/hooks/useHistory';
import { useEditorAI } from '@/hooks/editor/useEditorAI';
import { buildDraftStorageKey } from '@/hooks/editor/useEditorAutosave';

interface LocalDraftPayload {
  cvData: CVData;
  lastSaved?: string;
}

const normalizeEditorData = (sourceData: CVData): CVData => {
  const safeSections = Array.isArray(sourceData.sections) ? sourceData.sections : [];
  const resolvedLanguage = isSupportedLanguage(sourceData.language)
    ? sourceData.language
    : (inferLanguageFromSections(safeSections) || 'vi');

  return {
    ...sourceData,
    language: resolvedLanguage,
    sections: normalizeSectionTitles(safeSections, resolvedLanguage),
    settings: {
      ...(sourceData.settings || {}),
      labels: {
        ...(sourceData.settings?.labels || {}),
        present: getPresentLabel(resolvedLanguage),
        contact: getContactLabel(resolvedLanguage),
      },
    },
  };
};

const getRouteDraftPrefix = (userId: string | null | undefined, routePath: string) =>
  `cv_draft:${userId || 'guest'}:${routePath}:`;

const findLatestRouteDraft = (
  userId: string | null | undefined,
  routePath: string,
): { key: string; payload: LocalDraftPayload } | null => {
  const prefix = getRouteDraftPrefix(userId, routePath);
  let latestDraft: { key: string; payload: LocalDraftPayload; savedAt: number } | null = null;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(prefix)) {
      continue;
    }

    const rawDraft = localStorage.getItem(key);
    if (!rawDraft) {
      continue;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as LocalDraftPayload;
      const hasSections = Array.isArray(parsedDraft?.cvData?.sections);

      if (!hasSections) {
        localStorage.removeItem(key);
        continue;
      }

      const savedAt = parsedDraft.lastSaved ? new Date(parsedDraft.lastSaved).getTime() : 0;
      if (!latestDraft || savedAt > latestDraft.savedAt) {
        latestDraft = { key, payload: parsedDraft, savedAt };
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  if (!latestDraft) {
    return null;
  }

  return {
    key: latestDraft.key,
    payload: latestDraft.payload,
  };
};

const clearRouteDrafts = (userId: string | null | undefined, routePath: string) => {
  const prefix = getRouteDraftPrefix(userId, routePath);

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
};

export default function MyCVPage() {
  const params = useParams();
  const cvId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading, ensureAccessToken } = useAuth();
  const router = useRouter();

  type ApiSectionItem = {
    id: string;
    content: Record<string, unknown>;
    position?: number;
  };

  type ApiSection = {
    id: string;
    section_type: CVSection['section_type'];
    title: string;
    is_visible?: boolean;
    cv_section_items?: ApiSectionItem[];
  };

  type ApiCvDetail = {
    id: string;
    name?: string;
    template_id: string;
    language?: string;
    settings?: CVData['settings'];
    cv_sections?: ApiSection[];
  };

  type ApiLikeError = {
    message?: string;
    response?: {
      status?: number;
      data?: unknown;
    };
  };

  const {
    state: cvData,
    setState: setCvData,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<CVData>(MODERN_SAMPLE_DATA, 50);

  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showUndoRedoToast, setShowUndoRedoToast] = useState<string | null>(null);
  const [isLocalDraftDirty, setIsLocalDraftDirty] = useState(false);

  const { applyAIChatOperations } = useEditorAI({
    cvData,
    setCvData,
    setIsDraftDirty: setIsLocalDraftDirty,
  });

  useEffect(() => {
    const loadCV = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để truy cập CV');
        router.push('/');
        return;
      }

      try {
        setIsPageLoading(true);
        const token = await ensureAccessToken();
        const cv = (await api.getCvById(token, cvId)) as ApiCvDetail;

        const normalizedData: CVData = {
          id: cv.id,
          name: cv.name,
          template_id: cv.template_id,
          language: cv.language || 'vi',
          settings: cv.settings || {},
          sections: (cv.cv_sections || []).map((section): CVSection => ({
            id: section.id,
            cv_id: cv.id,
            section_type: section.section_type,
            title: section.title,
            is_visible: section.is_visible ?? true,
            items: (section.cv_section_items || [])
              .map((item): CVSectionItem => ({
                id: item.id,
                section_id: section.id,
                content: item.content,
                position: item.position ?? 0,
              }))
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
          })),
        };

        const normalizedWithLanguage = normalizeEditorData(normalizedData);
        const routePath = window.location.pathname;
        const localDraft = findLatestRouteDraft(user?.id, routePath);

        if (localDraft) {
          const shouldUseDraft = window.confirm(
            'Phát hiện dữ liệu nhập chưa lưu trong localStorage. Bạn có muốn sử dụng lại không?',
          );

          if (shouldUseDraft) {
            const normalizedDraft = normalizeEditorData({
              ...localDraft.payload.cvData,
              id: cv.id,
            });
            resetHistory(normalizedDraft);
            toast.success('Đã nạp dữ liệu từ localStorage');
          } else {
            localStorage.removeItem(localDraft.key);
            resetHistory(normalizedWithLanguage);
            toast.info('Đã xóa dữ liệu localStorage cũ');
          }
        } else {
          resetHistory(normalizedWithLanguage);
        }
      } catch (error: unknown) {
        const apiError = (error as ApiLikeError) || {};
        console.error('Error loading CV from API:', error);

        if (apiError.response?.status === 401) {
          toast.error('Token hết hạn. Vui lòng đăng nhập lại.');
          router.push('/');
        } else if (apiError.response?.status === 403) {
          toast.error('Bạn không có quyền truy cập CV này.');
          router.push('/my-cvs');
        } else if (apiError.response?.status === 404) {
          toast.error('CV không tồn tại.');
          router.push('/my-cvs');
        } else if (typeof apiError.message === 'string' && apiError.message.includes('đăng nhập')) {
          toast.error(apiError.message);
          router.push('/');
        } else {
          toast.error('Không thể tải CV. Vui lòng thử lại.');
          router.push('/my-cvs');
        }
      } finally {
        setIsPageLoading(false);
      }
    };

    loadCV();
  }, [cvId, isAuthenticated, authLoading, router, ensureAccessToken, resetHistory, user?.id]);

  useEffect(() => {
    if (isPageLoading || !isLocalDraftDirty) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const routePath = window.location.pathname;
        const draftStorageKey = buildDraftStorageKey(
          user?.id,
          routePath,
          cvData.template_id || 'unknown-template',
        );

        const dataToSave: LocalDraftPayload = {
          cvData,
          lastSaved: new Date().toISOString(),
        };

        localStorage.setItem(draftStorageKey, JSON.stringify(dataToSave));
        setIsLocalDraftDirty(false);
      } catch (error) {
        console.error('Error saving local draft:', error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [cvData, isLocalDraftDirty, isPageLoading, user?.id]);

  const saveToBackend = async () => {
    try {
      const token = await ensureAccessToken();

      const cvDataToSave = {
        template_id: cvData.template_id,
        language: cvData.language || 'vi',
        settings: cvData.settings || {},
        sections: cvData.sections.map(section => ({
          section_type: section.section_type,
          title: section.title,
          is_visible: section.is_visible ?? true,
          items: section.items.map(item => ({
            content: item.content,
            position: item.position || 0,
          })),
        })),
      };

      const savedCv = await api.updateCv(token, cvId, cvDataToSave);
      return savedCv;
    } catch (error) {
      console.error('Error saving to DB:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveToBackend();
      clearRouteDrafts(user?.id, window.location.pathname);
      setIsLocalDraftDirty(false);
      toast.success('CV đã được lưu thành công!');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : undefined;
      console.error('Error saving:', error);
      toast.error(message || 'Không thể lưu CV. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateChange = useCallback((newTemplateId: string) => {
    setCvData({ ...cvData, template_id: newTemplateId }, true);
    setIsLocalDraftDirty(true);
  }, [cvData, setCvData]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    undo();
    setShowUndoRedoToast('Đã hoàn tác');
    setTimeout(() => setShowUndoRedoToast(null), 2000);
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    redo();
    setShowUndoRedoToast('Đã làm lại');
    setTimeout(() => setShowUndoRedoToast(null), 2000);
  }, [canRedo, redo]);

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    setCvData({
      ...cvData,
      settings: {
        ...cvData.settings,
        fontSize,
      },
    });
    setIsLocalDraftDirty(true);
  };

  const handleLanguageChange = (language: Language) => {
    const updatedSections = normalizeSectionTitles(cvData.sections, language);
    setCvData({
      ...cvData,
      language,
      sections: updatedSections,
      settings: {
        ...cvData.settings,
        labels: {
          ...(cvData.settings?.labels || {}),
          present: getPresentLabel(language),
          contact: getContactLabel(language),
        },
      },
    });
    setIsLocalDraftDirty(true);
  };

  const handleExportPDF = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tải xuống CV');
      return;
    }

    try {
      setIsSaving(true);
      const token = await ensureAccessToken();

      const cvDataToExport = {
        template_id: cvData.template_id,
        name: cvData.name || new Date().toISOString(),
        language: cvData.language || 'vi',
        settings: cvData.settings || {},
        sections: cvData.sections.map(section => ({
          section_type: section.section_type,
          title: section.title,
          is_visible: section.is_visible ?? true,
          items: section.items.map(item => ({
            content: item.content,
            position: item.position || 0,
          })),
        })),
      };

      const exportCv = await api.createExportCv(token, cvDataToExport);
      const pdfBlob = await api.exportCvPdf(token, { cvId: exportCv.id, filename: `CV-${exportCv.id}` });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV-${exportCv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CV đã được tải xuống thành công!');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : undefined;
      console.error('Error exporting PDF:', error);
      toast.error(message || 'Không thể tải xuống CV. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    toast.info('Tính năng chia sẻ đang được phát triển!');
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải CV...</p>
        </div>
      </div>
    );
  }

  const template = getTemplate(cvData.template_id);

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Template không tồn tại</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <EditorTopBar
        isSaving={isSaving}
        language={(cvData.language as Language) || 'vi'}
        currentFontSize={(cvData.settings?.fontSize as 'small' | 'medium' | 'large') || 'medium'}
        onFontSizeChange={handleFontSizeChange}
        onLanguageChange={handleLanguageChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        onShare={handleShare}
        onTemplateChange={() => setShowTemplateModal(true)}
        onToggleAI={() => setShowAIPanel((prev) => !prev)}
      />

      <TemplatePreviewModal
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        currentTemplateId={cvData.template_id}
        currentData={cvData}
        onTemplateSelect={handleTemplateChange}
      />

      {showUndoRedoToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {showUndoRedoToast}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[55%] border-r border-blue-100 dark:border-slate-800 bg-white dark:bg-background">
          <CVInputPanel
            data={cvData}
            onChange={(data) => {
              setCvData(data, true);
              setIsLocalDraftDirty(true);
            }}
          />
        </div>

        <div className="w-[45%] bg-slate-50 dark:bg-slate-900">
          <CVPreviewPanel
            data={cvData}
            TemplateComponent={template.component}
          />
        </div>
      </div>

      <AIAssistantPanel
        open={showAIPanel}
        cvData={cvData}
        onClose={() => setShowAIPanel(false)}
        onApplyOperations={applyAIChatOperations}
      />
    </div>
  );
}
