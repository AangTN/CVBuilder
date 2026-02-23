'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, BlogPostItem, BlogCategoryItem, BlogTagItem } from '@/features/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, RefreshCw, Plus, Pencil, Trash2, Globe, Hash,
  FileText, Eye, ChevronLeft, ChevronRight, X, Check,
  BookOpen, Columns2,
} from 'lucide-react';
import { marked } from 'marked';
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

interface PostForm {
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  categoryId: string;
  status: 'draft' | 'published';
  metaTitle: string;
  metaDescription: string;
  tagIds: string[];
}

const EMPTY_FORM: PostForm = {
  title: '', slug: '', summary: '', content: '',
  thumbnail: '', categoryId: '', status: 'draft',
  metaTitle: '', metaDescription: '',
  tagIds: [],
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã đăng' },
];

function renderMarkdown(content: string): string {
  if (!content.trim()) return '';
  try {
    const html = marked.parse(content, { async: false }) as string;
    // Strip dangerous patterns (admin-only, lightweight guard)
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?(iframe|object|embed|svg|style|link|meta)[^>]*>/gi, '')
      .replace(/\s+on[a-z]+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript\s*:/gi, '');
  } catch {
    return content;
  }
}

export default function AdminPostsPage() {
  const { ensureAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'split' | 'edit'>('split');
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [tags, setTags] = useState<BlogTagItem[]>([]);

  // form
  const [formMode, setFormMode] = useState<'new' | string | null>(null); // null=closed, 'new', or post id
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const token = await ensureAccessToken();
      const [cats, tagList] = await Promise.all([
        api.getBlogCategories(token),
        api.getBlogTags(token),
      ]);
      setCategories(cats);
      setTags(tagList);
    } catch {
      // non-fatal
    }
  }, [ensureAccessToken]);

  const fetchPosts = useCallback(async (p = page, status = statusFilter) => {
    try {
      setLoading(true);
      const token = await ensureAccessToken();
      const res = await api.getBlogPosts(token, { page: p, pageSize: 15, status: status || undefined });
      setPosts(res.posts);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách bài viết.');
    } finally {
      setLoading(false);
    }
  }, [ensureAccessToken, page, statusFilter]);

  useEffect(() => {
    void loadCategories();
    void fetchPosts();
  }, [fetchPosts, loadCategories]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    void fetchPosts(1, status);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormMode('new');
  };

  const openEdit = async (post: BlogPostItem) => {
    setFormMode(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      summary: post.summary ?? '',
      content: '',
      thumbnail: post.thumbnail ?? '',
      categoryId: post.category?.id ?? '',
      status: post.status,
      metaTitle: post.metaTitle ?? '',
      metaDescription: post.metaDescription ?? '',
      tagIds: (post.tags ?? []).map((t) => t.id),
    });
    try {
      const token = await ensureAccessToken();
      const full = await api.getBlogPost(token, post.id);
      setForm((f) => ({ ...f, content: full.content ?? '' }));
    } catch {
      // non-fatal, user can type content manually
    }
  };

  const closeForm = () => {
    setFormMode(null);
    setForm(EMPTY_FORM);
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Tiêu đề và slug là bắt buộc');
      return;
    }
    if (formMode === 'new' && !form.content.trim()) {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }

    setSaving(true);
    try {
      const token = await ensureAccessToken();
      const payload = {
        title: form.title,
        slug: form.slug,
        summary: form.summary || undefined,
        content: form.content || undefined,
        thumbnail: form.thumbnail || undefined,
        categoryId: form.categoryId || undefined,
        status: form.status,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        tagIds: form.tagIds,
      };

      if (formMode === 'new') {
        await api.createBlogPost(token, payload as Parameters<typeof api.createBlogPost>[1]);
        toast.success('Đã tạo bài viết mới');
      } else {
        await api.updateBlogPost(token, formMode!, payload);
        toast.success('Đã cập nhật bài viết');
      }

      closeForm();
      await fetchPosts();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      toast.error(msg?.includes('Unique') ? 'Slug đã tồn tại' : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa bài viết "${title}"?`)) return;
    setDeleting(id);
    try {
      const token = await ensureAccessToken();
      await api.deleteBlogPost(token, id);
      toast.success('Đã xóa bài viết');
      await fetchPosts();
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quản lý bài viết</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng cộng <strong>{total}</strong> bài viết.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => void fetchPosts()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" className="gap-2" onClick={openNew} disabled={formMode !== null}>
            <Plus className="h-4 w-4" /> Thêm bài viết
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleStatusFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              statusFilter === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Inline form */}
      {formMode !== null && (
        <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-base">{formMode === 'new' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}</h2>

          {/* Row 1: title + slug */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Tiêu đề *</label>
              <Input placeholder="Tiêu đề bài viết" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Slug *</label>
              <Input placeholder="tieu-de-bai-viet" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>

          {/* Row 2: category + status + thumbnail */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Thể loại</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Không có</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Trạng thái</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
              >
                <option value="draft">Nháp</option>
                <option value="published">Đăng ngay</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Thumbnail URL</label>
              <Input placeholder="https://..." value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} />
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" /> Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tagIds: selected
                            ? f.tagIds.filter((id) => id !== tag.id)
                            : [...f.tagIds, tag.id],
                        }))
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      <Hash className="h-3 w-3" />
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              {form.tagIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Đã chọn: {form.tagIds.length} tag
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Tóm tắt</label>
            <Input placeholder="Đoạn mô tả ngắn hiển thị ở trang danh sách..." value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                Nội dung {formMode === 'new' && <span className="text-red-500">*</span>}
                {formMode !== 'new' && <span className="text-muted-foreground font-normal ml-1">(bỏ trống = không đổi)</span>}
              </label>
              <button
                type="button"
                onClick={() => setPreviewMode((m) => (m === 'split' ? 'edit' : 'split'))}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                {previewMode === 'split' ? (
                  <><FileText className="h-3.5 w-3.5" /> Chỉ soạn thảo</>
                ) : (
                  <><Columns2 className="h-3.5 w-3.5" /> Xem song song</>
                )}
              </button>
            </div>

            {previewMode === 'split' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground font-medium">✏️ Soạn thảo (Markdown / HTML)</p>
                  <textarea
                    className="w-full h-[320px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                    placeholder="Nội dung Markdown hoặc HTML..."
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground font-medium">👁️ Xem trước</p>
                  <div
                    className="h-[320px] overflow-y-auto rounded-md border border-dashed border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_hr]:my-3 [&_hr]:border-gray-200"
                    dangerouslySetInnerHTML={{
                      __html: form.content.trim()
                        ? renderMarkdown(form.content)
                        : '<p class="text-gray-400 italic">Chưa có nội dung...</p>',
                    }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                className="w-full min-h-[320px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                placeholder="Nội dung Markdown hoặc HTML..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">SEO</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Meta Title</label>
                  <span className={`text-[11px] font-mono ${
                    form.metaTitle.length > 60 ? 'text-red-500 font-bold' :
                    form.metaTitle.length > 50 ? 'text-amber-500' : 'text-gray-400'
                  }`}>{form.metaTitle.length}/60</span>
                </div>
                <Input
                  placeholder="Mặc định dùng tiêu đề bài viết"
                  maxLength={70}
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                />
                {form.metaTitle.length > 60 && (
                  <p className="text-[11px] text-red-500">Google cắt sau 60 ký tự — rút gọn lại</p>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Meta Description</label>
                  <span className={`text-[11px] font-mono ${
                    form.metaDescription.length > 155 ? 'text-red-500 font-bold' :
                    form.metaDescription.length > 130 ? 'text-amber-500' : 'text-gray-400'
                  }`}>{form.metaDescription.length}/155</span>
                </div>
                <textarea
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  placeholder="Mặc định dùng tóm tắt bài viết"
                  maxLength={170}
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                />
                {form.metaDescription.length > 155 && (
                  <p className="text-[11px] text-red-500">Google cắt sau 155 ký tự — rút gọn lại</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="gap-2" onClick={() => void handleSubmit()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {formMode === 'new' ? 'Tạo bài viết' : 'Lưu thay đổi'}
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={closeForm} disabled={saving}>
              <X className="h-4 w-4" /> Hủy
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <BookOpen className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Chưa có bài viết nào.</p>
            <Button size="sm" variant="outline" onClick={openNew} disabled={formMode !== null}>
              <Plus className="h-4 w-4 mr-1" /> Tạo bài viết đầu tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                  <th className="px-4 py-3 font-semibold">Thể loại</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-center">
                    <Eye className="inline h-3.5 w-3.5" />
                  </th>
                  <th className="px-4 py-3 font-semibold">Tác giả</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                      <code className="text-[11px] text-slate-400">{post.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {post.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.status === 'published' ? (
                          <><Globe className="h-3 w-3" /> Đã đăng</>
                        ) : (
                          <><FileText className="h-3 w-3" /> Nháp</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{post.viewCount}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{post.author?.name ?? post.author?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          title="Sửa"
                          disabled={formMode !== null || deleting === post.id}
                          onClick={() => void openEdit(post)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          title="Xóa"
                          disabled={deleting === post.id || formMode !== null}
                          onClick={() => void handleDelete(post.id, post.title)}
                        >
                          {deleting === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Trang {page} / {totalPages} &nbsp;·&nbsp; {total} bài viết
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={page <= 1 || loading}
              onClick={() => { setPage(page - 1); void fetchPosts(page - 1); }}
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={page >= totalPages || loading}
              onClick={() => { setPage(page + 1); void fetchPosts(page + 1); }}
            >
              Tiếp <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
