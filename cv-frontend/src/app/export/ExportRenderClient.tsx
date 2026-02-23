'use client';

import { useEffect, useMemo } from 'react';
import { decodeCvData } from '@/lib/utils';
import { CVData } from '@/lib/types';
import { getTemplate } from '@/templates/registry';

interface ExportRenderClientProps {
  encodedData: string;
}

declare global {
  interface Window {
    isRenderFinished?: boolean;
  }
}

type DecodedResult = {
  cvData: CVData | null;
  error: string;
};

export function ExportRenderClient({ encodedData }: ExportRenderClientProps) {
  const markRenderFinished = () => {
    if (typeof window !== 'undefined') {
      window.isRenderFinished = true;
    }
  };

  useEffect(() => {
    window.isRenderFinished = false;
  }, []);

  const decoded = useMemo<DecodedResult>(() => {
    try {
      const parsed = decodeCvData(encodedData) as CVData;
      return { cvData: parsed, error: '' };
    } catch {
      return { cvData: null, error: 'Dữ liệu export không hợp lệ' };
    }
  }, [encodedData]);

  const { cvData, error } = decoded;

  const template = useMemo(() => {
    if (!cvData?.template_id) return null;
    return getTemplate(cvData.template_id);
  }, [cvData]);

  useEffect(() => {
    if (!cvData || !template) return;

    let cancelled = false;
    const markReady = async () => {
      try {
        await document.fonts?.ready;
      } catch {
        // ignore font loading errors
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      if (!cancelled) {
        markRenderFinished();
      }
    };

    markReady();

    return () => {
      cancelled = true;
    };
  }, [cvData, template]);

  if (error || !cvData || !template) {
    markRenderFinished();
    return null;
  }

  const TemplateComponent = template.component;
  return <TemplateComponent data={cvData} />;
}
