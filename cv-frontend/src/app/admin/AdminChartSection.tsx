'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AdminDashboardStatsResponse } from '@/features/api';
import {
  areaPath,
  CHART_HEIGHT,
  CHART_PADDING_BOTTOM,
  CHART_PADDING_TOP,
  CHART_PADDING_X,
  CHART_WIDTH,
  formatBucketLabel,
  linePath,
} from './chart-utils';
import { AdminPeriod } from './use-admin-dashboard';

type AdminChartSectionProps = {
  stats: AdminDashboardStatsResponse;
  selectedPeriod: AdminPeriod;
  onRefresh: () => void;
};

export function AdminChartSection({
  stats,
  selectedPeriod,
  onRefresh,
}: AdminChartSectionProps) {
  const maxSeriesValue = useMemo(() => {
    if (!stats.series.length) {
      return 1;
    }

    return Math.max(
      ...stats.series.flatMap((item) => [item.createdCount, item.downloadCount]),
      1,
    );
  }, [stats.series]);

  const chartData = useMemo(() => {
    if (!stats.series.length) {
      return [] as Array<{
        x: number;
        createdY: number;
        downloadY: number;
        bucket: string;
      }>;
    }

    const plotWidth = CHART_WIDTH - CHART_PADDING_X * 2;
    const plotHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const denominator = Math.max(stats.series.length - 1, 1);

    return stats.series.map((item, index) => {
      const x = CHART_PADDING_X + (index / denominator) * plotWidth;
      const createdY =
        CHART_PADDING_TOP +
        (1 - item.createdCount / maxSeriesValue) * plotHeight;
      const downloadY =
        CHART_PADDING_TOP +
        (1 - item.downloadCount / maxSeriesValue) * plotHeight;

      return {
        x,
        createdY,
        downloadY,
        bucket: item.bucket,
      };
    });
  }, [maxSeriesValue, stats.series]);

  const axisLabels = useMemo(() => {
    if (!chartData.length) {
      return [] as Array<{ x: number; label: string }>;
    }

    if (selectedPeriod === 'day') {
      const step = Math.max(1, Math.floor(chartData.length / 8));
      return chartData
        .filter((_, index) => index % step === 0 || index === chartData.length - 1)
        .map((point) => ({
          x: point.x,
          label: `${new Date(point.bucket).getUTCHours()}h`,
        }));
    }

    if (selectedPeriod === 'week') {
      return chartData.map((point) => ({
        x: point.x,
        label:
          ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][
            new Date(point.bucket).getUTCDay()
          ] || '',
      }));
    }

    if (selectedPeriod === 'year') {
      return chartData.map((point) => ({
        x: point.x,
        label: `T${new Date(point.bucket).getUTCMonth() + 1}`,
      }));
    }

    const step = Math.max(1, Math.floor(chartData.length / 8));
    return chartData
      .filter((_, index) => index % step === 0 || index === chartData.length - 1)
      .map((point) => ({
        x: point.x,
        label: formatBucketLabel(point.bucket, stats.granularity),
      }));
  }, [chartData, selectedPeriod, stats.granularity]);

  return (
    <div className="mb-6 rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {selectedPeriod === 'day' ? 'Biểu đồ theo giờ' :
           selectedPeriod === 'week' ? 'Biểu đồ trong tuần' :
           selectedPeriod === 'year' ? 'Biểu đồ trong năm' :
           'Biểu đồ số lượng'}
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          Làm mới biểu đồ
        </Button>
      </div>

      {stats.series.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Không có dữ liệu trong khoảng thời gian này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[300px] w-full min-w-[720px]"
            role="img"
            aria-label="Biểu đồ miền số lượng CV tạo và download"
          >
            <defs>
              <linearGradient id="createdArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="downloadArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <line
              x1={CHART_PADDING_X}
              y1={CHART_HEIGHT - CHART_PADDING_BOTTOM}
              x2={CHART_WIDTH - CHART_PADDING_X}
              y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
              stroke="#CBD5E1"
            />

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y =
                CHART_PADDING_TOP +
                ratio *
                  (CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM);
              const value = Math.round((1 - ratio) * maxSeriesValue);
              return (
                <g key={ratio}>
                  <line
                    x1={CHART_PADDING_X}
                    y1={y}
                    x2={CHART_WIDTH - CHART_PADDING_X}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={CHART_PADDING_X - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[11px]"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            <path
              d={areaPath(
                chartData.map((point) => ({ x: point.x, y: point.createdY })),
                CHART_HEIGHT - CHART_PADDING_BOTTOM,
              )}
              fill="url(#createdArea)"
            />
            <path
              d={linePath(
                chartData.map((point) => ({ x: point.x, y: point.createdY })),
              )}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />

            <path
              d={areaPath(
                chartData.map((point) => ({ x: point.x, y: point.downloadY })),
                CHART_HEIGHT - CHART_PADDING_BOTTOM,
              )}
              fill="url(#downloadArea)"
            />
            <path
              d={linePath(
                chartData.map((point) => ({ x: point.x, y: point.downloadY })),
              )}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
            />

            {axisLabels.map((item) => (
              <text
                key={`${item.x}-${item.label}`}
                x={item.x}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {item.label}
              </text>
            ))}
          </svg>

          <div className="pt-2 text-xs text-muted-foreground">
            <span className="mr-4 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> CV tạo
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> CV download
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
