'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, AdminAccountsResponse } from '@/features/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, Users, ShieldCheck, UserCheck2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../chart-utils';

type Account = AdminAccountsResponse['accounts'][0];

export default function AdminAccountsPage() {
  const { ensureAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminAccountsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const token = await ensureAccessToken();
      const res = await api.getAdminAccounts(token);
      setData(res);
    } catch {
      toast.error('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => { void fetchAccounts(); }, [fetchAccounts]);

  const handleToggleActive = async (account: Account) => {
    setUpdating(account.id);
    try {
      const token = await ensureAccessToken();
      await api.updateAdminAccount(token, account.id, { isActive: !account.isActive });
      toast.success(`Đã ${!account.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      await fetchAccounts();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleRole = async (account: Account) => {
    const newRole = account.role === 'admin' ? 'user' : 'admin';
    setUpdating(account.id);
    try {
      const token = await ensureAccessToken();
      await api.updateAdminAccount(token, account.id, { role: newRole });
      toast.success(`Đã đổi role sang ${newRole}`);
      await fetchAccounts();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = data?.accounts.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.email.toLowerCase().includes(q) ||
      (a.fullName ?? '').toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-muted-foreground">Xem, kích hoạt, đổi role người dùng.</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => void fetchAccounts()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng tài khoản</p>
              <p className="text-xl font-black">{data.summary.total}</p>
            </div>
          </div>
          <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <UserCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-black">{data.summary.active}</p>
            </div>
          </div>
          <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin</p>
              <p className="text-xl font-black">{data.summary.admins}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Họ tên</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">
                    <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5" /> Balance</span>
                  </th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Không tìm thấy tài khoản nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((account) => (
                    <tr key={account.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{account.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{account.fullName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          account.role === 'admin'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {account.role === 'admin' ? 'admin' : 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{account.balance ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          account.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(account.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={updating === account.id}
                            onClick={() => void handleToggleRole(account)}
                          >
                            {updating === account.id ? <Loader2 className="h-3 w-3 animate-spin" /> : account.role === 'admin' ? '→ User' : '→ Admin'}
                          </Button>
                          <Button
                            size="sm"
                            variant={account.isActive ? 'destructive' : 'outline'}
                            className="h-7 text-xs"
                            disabled={updating === account.id}
                            onClick={() => void handleToggleActive(account)}
                          >
                            {updating === account.id ? <Loader2 className="h-3 w-3 animate-spin" /> : account.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
