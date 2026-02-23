'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, BlogTagItem } from '@/features/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Plus, Pencil, Trash2, Hash, X, Check } from 'lucide-react';
import { toast } from 'sonner';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface FormState {
  name: string;
  slug: string;
}

const EMPTY_FORM: FormState = { name: '', slug: '' };

export default function AdminTagsPage() {
  const { ensureAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<BlogTagItem[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // null = closed, 'new' = creating, id string = editing
  const [formMode, setFormMode] = useState<'new' | string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const token = await ensureAccessToken();
      const res = await api.getBlogTags(token);
      setTags(res);
    } catch {
      toast.error('Không thể tải danh sách tags.');
    } finally {
      setLoading(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => { void fetchTags(); }, [fetchTags]);

  const openNew = () => { setForm(EMPTY_FORM); setFormMode('new'); };
  const openEdit = (tag: BlogTagItem) => {
    setForm({ name: tag.name, slug: tag.slug });
    setFormMode(tag.id);
  };
  const closeForm = () => { setFormMode(null); setForm(EMPTY_FORM); };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Vui lòng điền tên và slug');
      return;
    }
    setSaving(true);
    try {
      const token = await ensureAccessToken();
      if (formMode === 'new') {
        await api.createBlogTag(token, { name: form.name, slug: form.slug });
        toast.success('Đã tạo tag mới');
      } else {
        await api.updateBlogTag(token, formMode!, { name: form.name, slug: form.slug });
        toast.success('Đã cập nhật tag');
      }
      closeForm();
      await fetchTags();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      toast.error(msg?.includes('Unique') ? 'Tên hoặc slug đã tồn tại' : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa tag "#${name}"? Tag sẽ được gỡ khỏi tất cả bài viết liên quan.`)) return;
    setDeleting(id);
    try {
      const token = await ensureAccessToken();
      await api.deleteBlogTag(token, id);
      toast.success('Đã xóa tag');
      await fetchTags();
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = tags.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quản lý Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tags giúp nhóm bài viết theo chủ đề nhỏ (ví dụ: #NodeJS, #Internship).
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => void fetchTags()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" className="gap-2" onClick={openNew} disabled={formMode !== null}>
            <Plus className="h-4 w-4" /> Thêm tag
          </Button>
        </div>
      </div>

      {/* Inline form */}
      {formMode !== null && (
        <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-base">{formMode === 'new' ? 'Tạo tag mới' : 'Chỉnh sửa tag'}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Tên tag *</label>
              <Input
                placeholder="ví dụ: NodeJS"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Slug *</label>
              <Input
                placeholder="nodejs"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="gap-2" onClick={() => void handleSubmit()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {formMode === 'new' ? 'Tạo tag' : 'Lưu'}
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={closeForm} disabled={saving}>
              <X className="h-4 w-4" /> Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats pill */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          Hiển thị <strong>{filtered.length}</strong> / {tags.length} tags
        </p>
      )}

      {/* Tag grid / table */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Hash className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">{tags.length === 0 ? 'Chưa có tag nào.' : 'Không tìm thấy tag phù hợp.'}</p>
            {tags.length === 0 && (
              <Button size="sm" variant="outline" onClick={openNew} disabled={formMode !== null}>
                <Plus className="h-4 w-4 mr-1" /> Tạo tag đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 font-semibold">Tag</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold text-center">Bài viết</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tag) => (
                  <tr key={tag.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400">
                        <Hash className="h-3 w-3" />
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-400">{tag.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 px-2 text-xs font-bold text-gray-600 dark:text-slate-400">
                        {tag.postCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          title="Sửa"
                          disabled={formMode !== null || deleting === tag.id}
                          onClick={() => openEdit(tag)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          title="Xóa"
                          disabled={deleting === tag.id || formMode !== null}
                          onClick={() => void handleDelete(tag.id, tag.name)}
                        >
                          {deleting === tag.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
