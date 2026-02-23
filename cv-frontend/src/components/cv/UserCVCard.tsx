'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTemplate } from "@/templates/registry";
import { CVData } from "@/lib/types";
import { Edit, Trash2, Download, FileText, CheckCircle2, Calendar } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";

interface UserCVCardProps {
  cv: {
    id: string;
    name?: string;
    template_id?: string;
    language?: string;
    settings?: Record<string, unknown>;
    cv_sections?: Array<{
      id: string;
      section_type: string;
      title: string;
      is_visible?: boolean;
      cv_section_items?: Array<{
        id: string;
        content: Record<string, unknown>;
        position?: number;
      }>;
    }>;
    created_at?: string;
    updated_at?: string;
    templates?: {
      id: string;
      name?: string;
    };
  };
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Ch\u01b0a c\u1eadp nh\u1eadt';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'H\u00f4m nay';
  if (diffDays === 1) return 'H\u00f4m qua';
  if (diffDays < 7) return `${diffDays} ng\u00e0y tr\u01b0\u1edbc`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tu\u1ea7n tr\u01b0\u1edbc`;
  return date.toLocaleDateString('vi-VN');
};

const toPreviewData = (cv: UserCVCardProps['cv']): CVData | null => {
  if (!cv.template_id || !Array.isArray(cv.cv_sections) || cv.cv_sections.length === 0) {
    return null;
  }

  return {
    id: cv.id,
    name: cv.name,
    template_id: cv.template_id,
    language: cv.language || 'vi',
    settings: cv.settings as CVData['settings'],
    sections: cv.cv_sections.map((section) => ({
      id: section.id,
      cv_id: cv.id,
      section_type: section.section_type as CVData['sections'][number]['section_type'],
      title: section.title,
      is_visible: section.is_visible ?? true,
      items: (section.cv_section_items || [])
        .map((item) => ({
          id: item.id,
          section_id: section.id,
          content: item.content,
          position: item.position ?? 0,
        }))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    })),
  };
};

export function UserCVCard({ cv, onDelete, onDownload }: UserCVCardProps) {
  const resolvedTemplateId = cv.template_id || cv.templates?.id || '';
  const template = getTemplate(resolvedTemplateId);
  const cvName = cv.name || `CV không tên`;
  const previewData = toPreviewData(cv);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.26);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) {
        return;
      }

      const containerWidth = previewContainerRef.current.offsetWidth;
      const calculatedScale = containerWidth / 793.7;
      setPreviewScale(calculatedScale);
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);

    if (previewContainerRef.current) {
      resizeObserver.observe(previewContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);
  
  return (
    <motion.div 
      className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mini Preview - Only show first page */}
      <div
        ref={previewContainerRef}
        className="aspect-[210/297] overflow-hidden bg-white dark:bg-slate-800 relative border-b-2 border-gray-100 dark:border-slate-700"
      >
        {template && previewData ? (
          <div className="absolute inset-0 origin-top-left pointer-events-none">
            <div
              style={{
                width: '210mm',
                height: '297mm',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              <template.component data={previewData} previewMode />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-850 dark:to-blue-950/30 flex flex-col items-center justify-center p-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center line-clamp-2">{cvName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">{template?.name || cv.templates?.name || 'Mẫu CV'}</p>
          </div>
        )}
        
        {/* Hover Actions Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/40 to-transparent flex items-center justify-center gap-3 backdrop-blur-[2px] z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Button size="icon" variant="secondary" asChild title="Chỉnh sửa" className="h-10 w-10 cursor-pointer pointer-events-auto shadow-lg">
              <Link href={`/my-cvs/${cv.id}`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
          </motion.div>
          {onDownload && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button size="icon" variant="secondary" onClick={() => onDownload(cv.id)} title="Tải PDF" className="h-10 w-10 cursor-pointer pointer-events-auto shadow-lg">
                <Download className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          {onDelete && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Button size="icon" variant="destructive" onClick={() => onDelete(cv.id)} title="Xóa" className="h-10 w-10 cursor-pointer pointer-events-auto shadow-lg">
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Card Info */}
      <div className="flex flex-col p-5 space-y-3 bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-900/80">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold tracking-tight text-base truncate text-gray-900 dark:text-slate-100 flex-1" title={cvName}>{cvName}</h3>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-900 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          {template?.name || cv.templates?.name || 'Mẫu CV'}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500 pt-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(cv.updated_at || cv.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}
