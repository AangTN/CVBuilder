'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/features/api';
import { UserCVCard } from '@/components/cv/UserCVCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FileText, CheckCircle2, History } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/page-transition';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/fade-in';
import { CVCardSkeleton } from '@/components/ui/card-skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type ApiCv = {
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
  templates?: {
    id: string;
    name?: string;
  };
  created_at?: string;
  updated_at?: string;
};

export default function MyCVsPage() {
  const PAGE_SIZE = 4;
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<ApiCv[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(cvs.length / PAGE_SIZE)),
    [cvs.length],
  );

  const paginatedCvs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return cvs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, cvs]);

  const toCvList = (payload: unknown): ApiCv[] => {
    if (Array.isArray(payload)) {
      return payload as ApiCv[];
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'items' in payload &&
      Array.isArray((payload as { items?: unknown }).items)
    ) {
      return (payload as { items: ApiCv[] }).items;
    }

    return [];
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchCVs = async () => {
      if (!accessToken) return;
      try {
        setLoading(true);
        setFetchError(null);
        const cvData = await api.getUserCvs(accessToken);
        const list = toCvList(cvData);
        setCvs(list);
        setCurrentPage(1);

        if (!Array.isArray(cvData) && list.length === 0) {
          setFetchError('Dữ liệu danh sách CV không hợp lệ. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
        setFetchError('Không thể tải danh sách CV. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCVs();
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      toast.warning('Nhấn xóa lần nữa trong 5 giây để xác nhận');
      setTimeout(() => {
        setPendingDeleteId((current) => (current === id ? null : current));
      }, 5000);
      return;
    }
    
    try {
      if (!accessToken) return;
      await api.deleteCv(accessToken, id);
      // Remove from list
      setCvs((prev) => prev.filter((cv) => cv.id !== id));
      setPendingDeleteId(null);
      toast.success('Đã xóa CV thành công');
    } catch (error) {
      console.error('Failed to delete CV:', error);
      toast.error('Không thể xóa CV. Vui lòng thử lại.');
    }
  };

  const handleDownload = async (id: string) => {
    if (!accessToken) return;
    try {
      toast.info('Đang chuẩn bị tệp PDF...');
      const pdfBlob = await api.exportCvPdf(accessToken, { cvId: id, filename: `CV-${id}` });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Tải xuống thành công!');

    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Không thể tải xuống CV. Vui lòng thử lại.');
    }
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-12 px-4">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                CV Của Tôi
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {cvs.length > 0 ? (
                  <>
                    <span className="font-semibold text-foreground">{cvs.length}</span> CV đã tạo
                  </>
                ) : (
                  'Quản lý tất cả các CV bạn đã tạo'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" variant="outline" asChild className="font-semibold">
                  <Link href="/my-cvs/download-history">
                    <History className="mr-2 h-5 w-5" /> Lịch sử tải xuống
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" asChild className="font-semibold shadow-lg">
                  <Link href="/templates">
                    <Plus className="mr-2 h-5 w-5" /> Tạo CV Mới
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {fetchError && (
          <FadeIn>
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {fetchError}
            </div>
          </FadeIn>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <CVCardSkeleton key={i} />
            ))}
          </div>
        ) : cvs.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed rounded-2xl bg-gradient-to-br from-blue-50 via-white to-sky-50/40 border-blue-200 dark:from-blue-950/20 dark:via-background dark:to-sky-950/20 dark:border-blue-900">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {/* Animated background circles */}
                <motion.div 
                  className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-blue-200/40"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-sky-200/40"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                />
                
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mb-6 shadow-lg dark:from-blue-900/40 dark:to-sky-900/40">
                  <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Chưa có CV nào
              </h2>
              <p className="text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
                Bắt đầu tạo CV chuyên nghiệp của bạn ngay hôm nay. Chọn từ nhiều mẫu đẹp và dễ sử dụng.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 dark:bg-card/60 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Miễn phí 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 dark:bg-card/60 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Chuẩn ATS</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 dark:bg-card/60 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Xuất PDF nhanh</span>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" asChild className="font-semibold shadow-lg">
                  <Link href="/templates">
                    <Plus className="mr-2 h-5 w-5" />
                    Tạo CV Đầu Tiên
                  </Link>
                </Button>
              </motion.div>
            </div>
          </FadeIn>
        ) : (
          <>
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCvs.map((cv) => (
                <StaggerItem key={cv.id}>
                  <UserCVCard
                    cv={cv}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {cvs.length > PAGE_SIZE && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;

                  return (
                    <Button
                      key={page}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-9"
                      aria-label={`Trang ${page}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  Sau
                </Button>
                <span className="ml-3 text-xs text-muted-foreground">
                  Trang {currentPage}/{totalPages} &bull; {cvs.length} CV
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
