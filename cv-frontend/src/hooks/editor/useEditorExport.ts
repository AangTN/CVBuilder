'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { CVData } from '@/lib/types';
import { api } from '@/features/api';

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

interface UseEditorExportParams {
  cvData: CVData;
  activeTemplateId: string;
  isAuthenticated: boolean;
  accessToken: string | null;
  ensureAccessToken: () => Promise<string>;
  setIsSaving: (value: boolean) => void;
}

export function useEditorExport({
  cvData,
  activeTemplateId,
  isAuthenticated,
  accessToken,
  ensureAccessToken,
  setIsSaving,
}: UseEditorExportParams) {
  const handleExportPDF = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      toast.error('Vui lòng đăng nhập để tải xuống CV');
      return;
    }

    try {
      setIsSaving(true);
      const token = await ensureAccessToken();

      const cvDataToExport = {
        template_id: activeTemplateId,
        name: cvData.name || new Date().toISOString(),
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

      const exportCv = await api.createExportCv(token, cvDataToExport);
      const blob = await api.exportCvPdf(token, {
        cvId: exportCv.id,
        filename: `CV-${exportCv.id}`,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV-${exportCv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('CV đã được tải xuống thành công!');
    } catch (error: unknown) {
      console.error('Error exporting PDF:', error);
      toast.error(getErrorMessage(error, 'Không thể tải xuống CV. Vui lòng thử lại.'));
    } finally {
      setIsSaving(false);
    }
  }, [
    activeTemplateId,
    accessToken,
    cvData,
    ensureAccessToken,
    isAuthenticated,
    setIsSaving,
  ]);

  return {
    handleExportPDF,
  };
}
