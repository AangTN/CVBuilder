'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { api, ExportHistoryItem } from '@/features/api';
import { getTemplate } from '@/templates/registry';
import type { CVData, CVSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageTransition } from '@/components/ui/page-transition';
import { FadeIn } from '@/components/ui/fade-in';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react';

type ApiSectionItem = {
  id: string;
  section_id: string;
  content: Record<string, unknown>;
  position?: number;
};

type ApiSection = {
  id: string;
  cv_id: string;
  section_type: CVSection['section_type'];
  title: string;
  is_visible?: boolean;
  cv_section_items?: ApiSectionItem[];
};

type ApiCvDetail = {
  id: string;
  name?: string;
  template_id?: string;
  language?: string;
  settings?: CVData['settings'];
  cv_sections?: ApiSection[];
};

const PAGE_SIZE = 20;

function toCvData(cv: ApiCvDetail): CVData {
  return {
    id: cv.id,
    name: cv.name,
    template_id: cv.template_id || '',
    language: cv.language || 'vi',
    settings: cv.settings || {},
    sections: (cv.cv_sections || []).map((section) => ({
      id: section.id,
      cv_id: section.cv_id,
      section_type: section.section_type,
      title: section.title,
      is_visible: section.is_visible ?? true,
      items: (section.cv_section_items || [])
        .map((item) => ({
          id: item.id,
          section_id: item.section_id,
          content: item.content,
          position: item.position ?? 0,
        }))
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    })),
  };
}

export default function DownloadHistoryPage() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<ExportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CVData | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken || !isAuthenticated) return;

      try {
        setLoading(true);
        setFetchError(null);
        const result = await api.getUserExportHistory(accessToken, page, PAGE_SIZE);
        setItems(result.items);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      } catch (error) {
        console.error('Failed to fetch export history:', error);
        setFetchError('Không thể tải lịch sử tải xuống. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken, isAuthenticated, page]);

  const paginationLabel = useMemo(() => {
    if (!totalItems) return '0 bản';
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, totalItems);
    return `${start}-${end} / ${totalItems} bản`;
  }, [page, totalItems]);

  const handleDownload = async (item: ExportHistoryItem) => {
    if (!accessToken || downloadingId) return;

    try {
      setDownloadingId(item.id);
      const filename = item.name || `CV-${item.id}`;
      const pdfBlob = await api.exportCvPdf(accessToken, {
        cvId: item.id,
        filename,
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CV đã tải xong!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Không thể tải xuống PDF. Vui lòng thử lại.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (item: ExportHistoryItem) => {
    if (!accessToken || previewingId) return;

    try {
      setPreviewingId(item.id);
      const cv = (await api.getCvById(accessToken, item.id)) as ApiCvDetail;
      const normalized = toCvData(cv);
      setPreviewData(normalized);
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Không thể xem lại bản xuất này.');
    } finally {
      setPreviewingId(null);
    }
  };

  const previewTemplate = previewData ? getTemplate(previewData.template_id) : null;

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Lịch sử tải xuống</h1>
              <p className="mt-1 text-muted-foreground">Mỗi trang hiển thị 20 bản xuất PDF gần nhất.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/my-cvs">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại CV của tôi
              </Link>
            </Button>
          </div>
        </FadeIn>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-card">
          <div className="border-b px-4 py-3 text-sm text-slate-600 dark:text-muted-foreground">{paginationLabel}</div>

          {fetchError && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {fetchError}
            </div>
          )}

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Chưa có lịch sử tải xuống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">Tên bản xuất</th>
                    <th className="px-4 py-3">Template</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isDownloading = downloadingId === item.id;
                    const isLocked = Boolean(downloadingId);
                    const isPreviewing = previewingId === item.id;
                    const isPreviewLocked = Boolean(previewingId);
                    return (
                      <tr key={item.id} className="border-t text-sm dark:border-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="truncate">{item.name || `CV-${item.id}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.templates?.name || 'Template'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : '--'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(item)}
                              disabled={isPreviewLocked}
                            >
                              {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                              Xem lại
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(item)}
                              disabled={isLocked}
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Tải PDF
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <span className="text-sm text-slate-600 dark:text-muted-foreground">Trang {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Sau <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Dialog open={Boolean(previewData)} onOpenChange={(open) => !open && setPreviewData(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Xem lại bản xuất</DialogTitle>
              <DialogDescription>
                Chế độ xem chỉ đọc, không hỗ trợ chỉnh sửa.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[70vh] overflow-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <div className="mx-auto w-fit rounded bg-white p-4 shadow-sm dark:bg-card">
                {previewData && previewTemplate ? (
                  <previewTemplate.component data={previewData} previewMode />
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Không thể hiển thị preview cho bản này.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
