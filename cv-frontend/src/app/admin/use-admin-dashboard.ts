'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, AdminDashboardStatsResponse } from '@/features/api';

export type AdminPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';

export function useAdminDashboard() {
  const { ensureAccessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AdminPeriod>('month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await ensureAccessToken();
      const statsResponse = await api.getAdminDashboardStats(token, {
        period: selectedPeriod,
        from: selectedPeriod === 'custom' ? fromDate || undefined : undefined,
        to: selectedPeriod === 'custom' ? toDate || undefined : undefined,
      });
      setStats(statsResponse);
    } catch {
      setError('Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }, [ensureAccessToken, fromDate, selectedPeriod, toDate]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return {
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
  };
}

