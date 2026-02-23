'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CVData } from '@/lib/types';
import {
  Language,
  normalizeSectionTitles,
} from '@/lib/sectionTitles';
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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useHistory } from '@/hooks/useHistory';
import { useEditorAutosave } from '@/hooks/editor/useEditorAutosave';
import { useEditorExport } from '@/hooks/editor/useEditorExport';
import { useEditorAI } from '@/hooks/editor/useEditorAI';

interface MessageError {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as MessageError).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

function EditorPageContent() {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('template');
  const { user, accessToken, isAuthenticated, ensureAccessToken } = useAuth();
  const router = useRouter();

  const templateId = templateIdParam || 'c24aa22b-194a-404a-a9d4-9626e58b8f7b';
  const initialTemplate = getTemplate(templateId);

  const {
    state: cvData,
    setState: setCvData,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<CVData>(initialTemplate?.sampleData || MODERN_SAMPLE_DATA, 50);

  const activeTemplateId = cvData?.template_id || templateId;
  const template = useMemo(() => getTemplate(activeTemplateId), [activeTemplateId]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [showUndoRedoToast, setShowUndoRedoToast] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const { lastSaved, clearDraft } = useEditorAutosave({
    templateId,
    cvData,
    userId: user?.id,
    isDraftDirty,
    setIsDraftDirty,
    setCvData,
    resetHistory,
  });

  const { handleExportPDF } = useEditorExport({
    cvData,
    activeTemplateId,
    isAuthenticated,
    accessToken,
    ensureAccessToken,
    setIsSaving,
  });

  const { applyAIChatOperations } = useEditorAI({
    cvData,
    setCvData,
    setIsDraftDirty,
  });

  const saveToBackend = useCallback(async () => {
    const token = await ensureAccessToken();

    const cvDataToSave = {
      template_id: activeTemplateId,
      language: cvData.language || 'vi',
      settings: cvData.settings || {},
      sections: cvData.sections.map((section) => ({
        section_type: section.section_type,
        title: section.title,
        is_visible: section.is_visible ?? true,
        items: section.items.map((item) => ({
          content: item.content,
          position: item.position || 0,
        })),
      })),
    };

    return api.createCv(token, cvDataToSave);
  }, [activeTemplateId, cvData, ensureAccessToken]);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu CV');
      return;
    }

    try {
      setIsSaving(true);
      const savedCv = await saveToBackend();
      clearDraft();
      toast.success('Lưu CV thành công!');
      router.push(`/my-cvs/${savedCv.id}`);
    } catch (error: unknown) {
      console.error('Error saving:', error);
      toast.error(getErrorMessage(error, 'Không thể lưu CV. Vui lòng thử lại.'));
      setIsSaving(false);
    }
  }, [clearDraft, isAuthenticated, router, saveToBackend]);

  const handleFontSizeChange = useCallback(
    (fontSize: 'small' | 'medium' | 'large') => {
      setIsDraftDirty(true);
      setCvData({
        ...cvData,
        settings: {
          ...cvData.settings,
          fontSize,
        },
      });
    },
    [cvData, setCvData],
  );

  const handleLanguageChange = useCallback(
    (language: Language) => {
      const updatedSections = normalizeSectionTitles(cvData.sections, language);
      setIsDraftDirty(true);
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
    },
    [cvData, setCvData],
  );

  const handleShare = useCallback(() => {
    toast.info('Tính năng chia sẻ đang được phát triển!');
  }, []);

  const handleTemplateChange = useCallback(
    (newTemplateId: string) => {
      setIsDraftDirty(true);
      setCvData(
        {
          ...cvData,
          template_id: newTemplateId,
        },
        true,
      );
    },
    [cvData, setCvData],
  );

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

  const shortcuts = useMemo(
    () => [
      {
        key: 's',
        ctrlKey: true,
        callback: () => {
          void handleSave();
        },
        description: 'Lưu CV',
      },
      {
        key: 'z',
        ctrlKey: true,
        callback: handleUndo,
        description: 'Hoàn tác',
      },
      {
        key: 'y',
        ctrlKey: true,
        callback: handleRedo,
        description: 'Làm lại',
      },
      {
        key: 'p',
        ctrlKey: true,
        callback: () => {
          void handleExportPDF();
        },
        description: 'Xuất PDF',
      },
    ],
    [handleExportPDF, handleRedo, handleSave, handleUndo],
  );

  useKeyboardShortcuts(shortcuts);

  if (!template) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Không tìm thấy mẫu CV</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Mẫu CV bạn chọn không còn tồn tại hoặc đã bị gỡ. Vui lòng chọn mẫu khác.
        </p>
        <a
          href="/templates"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Xem thư viện mẫu
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <EditorTopBar
        isSaving={isSaving}
        lastSaved={lastSaved}
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
        currentTemplateId={cvData.template_id || templateId}
        currentData={cvData}
        onTemplateSelect={handleTemplateChange}
      />

      {showUndoRedoToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {showUndoRedoToast}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[45%] border-r border-blue-100 bg-white dark:border-slate-800 dark:bg-background">
          <CVInputPanel
            data={cvData}
            onChange={(data) => {
              setCvData(data, true);
              setIsDraftDirty(true);
            }}
          />
        </div>

        <div className="w-[55%] bg-slate-50 dark:bg-slate-950">
          <CVPreviewPanel data={cvData} TemplateComponent={template.component} />
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

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Đang tải editor...
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}
