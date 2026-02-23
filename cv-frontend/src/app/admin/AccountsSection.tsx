'use client';

import { Users } from 'lucide-react';
import { AdminAccountsResponse } from '@/features/api';
import { formatDate } from './chart-utils';

type AccountsSectionProps = {
  accounts: AdminAccountsResponse;
};

export function AccountsSection({ accounts }: AccountsSectionProps) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Quản lý tài khoản</h2>
        <div className="text-sm text-muted-foreground">
          <span className="mr-3 inline-flex items-center gap-1">
            <Users className="h-4 w-4" /> Tổng: {accounts.summary.total}
          </span>
          <span className="mr-3">Active: {accounts.summary.active}</span>
          <span>Admin: {accounts.summary.admins}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Họ tên</th>
              <th className="px-3 py-2 font-semibold">Role</th>
              <th className="px-3 py-2 font-semibold">Trạng thái</th>
              <th className="px-3 py-2 font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {accounts.accounts.map((account) => (
              <tr key={account.id} className="border-b">
                <td className="px-3 py-2">{account.email}</td>
                <td className="px-3 py-2">{account.fullName || '-'}</td>
                <td className="px-3 py-2">{account.role || 'user'}</td>
                <td className="px-3 py-2">
                  {account.isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{formatDate(account.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
