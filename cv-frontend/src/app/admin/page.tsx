'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, BarChart3, Download, RefreshCw } from 'lucide-react';
import { useAdminDashboard } from './use-admin-dashboard';
import { AdminChartSection } from './AdminChartSection';

export default function AdminDashboardPage() {
  const {
    loading,
    error,
    stats,
    selectedPeriod,
    fromDate,
    toDate,
    setSelectedPeriod,
    setFromDate,
    setToDate,
    fetchDashboardData,
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thống kê hoạt động theo biểu đồ.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => void fetchDashboardData()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Period filter */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(['day', 'week', 'month', 'year', 'custom'] as const).map((period) => (
            <Button
              key={period}
              type="button"
              size="sm"
              variant={selectedPeriod === period ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'day' ? 'Trong ngày' : period === 'week' ? 'Trong tuần' : period === 'month' ? 'Trong tháng' : period === 'year' ? 'Trong năm' : 'Tùy chọn'}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input type="date" disabled={selectedPeriod !== 'custom'} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" disabled={selectedPeriod !== 'custom'} value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Button type="button" onClick={() => void fetchDashboardData()}>Áp dụng</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
                <BarChart3 className="h-4 w-4" /> Số CV tạo trong kỳ
              </div>
              <p className="text-3xl font-black">{stats.totals.created}</p>
            </div>
            <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
                <Download className="h-4 w-4" /> Số CV download trong kỳ
              </div>
              <p className="text-3xl font-black">{stats.totals.downloads}</p>
            </div>
          </div>
          <AdminChartSection stats={stats} selectedPeriod={selectedPeriod} onRefresh={() => void fetchDashboardData()} />
        </>
      ) : null}
    </div>
  );
}

