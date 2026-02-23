'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, LayoutDashboard, Users, FileText, Tag, Hash, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/accounts', label: 'Tài khoản', icon: Users, exact: false },
  { href: '/admin/posts', label: 'Bài viết', icon: FileText, exact: false },
  { href: '/admin/categories', label: 'Thể loại', icon: Tag, exact: false },
  { href: '/admin/tags', label: 'Tags', icon: Hash, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/'); return; }
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang admin');
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-60 shrink-0 border-r bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm transition-transform duration-200 md:static md:translate-x-0 md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center gap-2 border-b dark:border-slate-800 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Admin Panel</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 border-b dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:hidden">
          <button
            type="button"
            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Admin Panel</span>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
