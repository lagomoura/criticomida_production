'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faPlus,
  faShieldHalved,
  faTrashCan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Modal from '@/app/components/ui/Modal';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import { useToast } from '@/app/components/ui/Toast';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  type CategoryPayload,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/app/lib/api/categories';
import { ApiError } from '@/app/lib/api/client';
import { Category } from '@/app/lib/types';
import { cn } from '@/app/lib/utils/cn';

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: Category[] };

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCategoriasClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('admin.categorias');
  const toast = useToast();

  const [state, setState] = useState<ListState>({ status: 'loading' });
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const items = await getCategories();
      const sorted = [...items].sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });
      setState({ status: 'ready', items: sorted });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load();
    }
  }, [authLoading, user, load]);

  const handleCreated = useCallback(
    (category: Category) => {
      setState((prev) =>
        prev.status === 'ready'
          ? {
              ...prev,
              items: [...prev.items, category].sort((a, b) =>
                a.display_order !== b.display_order
                  ? a.display_order - b.display_order
                  : a.name.localeCompare(b.name),
              ),
            }
          : prev,
      );
      setCreating(false);
      toast.success(t('createSuccess'));
    },
    [t, toast],
  );

  const handleUpdated = useCallback(
    (category: Category) => {
      setState((prev) =>
        prev.status === 'ready'
          ? {
              ...prev,
              items: prev.items
                .map((c) => (c.id === category.id ? category : c))
                .sort((a, b) =>
                  a.display_order !== b.display_order
                    ? a.display_order - b.display_order
                    : a.name.localeCompare(b.name),
                ),
            }
          : prev,
      );
      setEditing(null);
      toast.success(t('updateSuccess'));
    },
    [t, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await deleteCategory(deleting.slug);
      setState((prev) =>
        prev.status === 'ready'
          ? { ...prev, items: prev.items.filter((c) => c.id !== deleting.id) }
          : prev,
      );
      toast.success(t('deleteSuccess'));
      setDeleting(null);
    } catch {
      toast.error(t('deleteError'));
    }
  }, [deleting, t, toast]);

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('accessRestricted')}
        </h1>
        <p className="max-w-md font-sans text-sm text-text-muted">{t('adminOnly')}</p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6 text-action-primary" aria-hidden />
          <div>
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action-primary">
              {t('kicker')}
            </p>
            <h1 className="m-0 font-display text-3xl font-medium text-text-primary sm:text-4xl">
              {t('title')}
            </h1>
            <p className="font-sans text-sm text-text-muted">{t('subtitle')}</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setCreating(true)}
          leftIcon={<FontAwesomeIcon icon={faPlus} className="h-3 w-3" />}
        >
          {t('newButton')}
        </Button>
      </header>

      {state.status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={64} />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="mb-2 h-5 w-5 text-action-danger"
            aria-hidden
          />
          <p className="mb-3 font-sans text-sm text-text-secondary">{t('loadError')}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            {t('retry')}
          </Button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState title={t('empty')} />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <CategoriesTable
          items={state.items}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      )}

      <CategoryFormModal
        open={creating}
        category={null}
        onClose={() => setCreating(false)}
        onSaved={handleCreated}
      />
      <CategoryFormModal
        open={editing !== null}
        category={editing}
        onClose={() => setEditing(null)}
        onSaved={handleUpdated}
      />
      <DeleteConfirmModal
        category={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

function CategoriesTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const t = useTranslations('admin.categorias');

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-default bg-surface-card">
      <table className="w-full border-collapse text-left">
        <thead className="bg-surface-subtle/50">
          <tr>
            <th className="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('tableName')}
            </th>
            <th className="hidden px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-text-muted md:table-cell">
              {t('tableSlug')}
            </th>
            <th className="hidden px-4 py-3 text-right font-sans text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">
              {t('tableOrder')}
            </th>
            <th className="hidden px-4 py-3 text-right font-sans text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">
              {t('tableReviews')}
            </th>
            <th className="px-4 py-3 text-right font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
              <span className="sr-only">{t('tableActions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t border-border-subtle">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {c.image_url ? (
                    <span className="relative inline-block h-10 w-10 overflow-hidden rounded-md bg-surface-subtle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-subtle font-display text-sm text-text-muted"
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="m-0 truncate font-sans text-sm font-medium text-text-primary">
                      {c.name}
                    </p>
                    <p className="m-0 truncate font-sans text-xs text-text-muted md:hidden">
                      /{c.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 font-sans text-sm text-text-secondary md:table-cell">
                <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-xs">/{c.slug}</code>
              </td>
              <td className="hidden px-4 py-3 text-right font-sans text-sm text-text-secondary tabular-nums sm:table-cell">
                {c.display_order}
              </td>
              <td className="hidden px-4 py-3 text-right font-sans text-sm text-text-secondary tabular-nums sm:table-cell">
                {c.review_count ?? 0}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(c)}
                    leftIcon={<FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />}
                  >
                    <span className="sr-only sm:not-sr-only">{t('edit')}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 font-sans text-xs font-medium text-action-danger transition-colors hover:bg-action-danger/10 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" aria-hidden />
                    <span className="sr-only sm:not-sr-only">{t('delete')}</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
  slugTouched: boolean;
}

function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (c: Category) => void;
}) {
  const t = useTranslations('admin.categorias');
  const toast = useToast();
  const isEdit = category !== null;

  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: '0',
    slugTouched: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        image_url: category.image_url ?? '',
        display_order: String(category.display_order ?? 0),
        slugTouched: true,
      });
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: '0',
        slugTouched: false,
      });
    }
    setErrors({});
  }, [open, category]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = t('validationName');
    if (!form.slug.trim()) {
      next.slug = t('validationSlug');
    } else if (!SLUG_REGEX.test(form.slug.trim())) {
      next.slug = t('validationSlugFormat');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload: CategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      display_order: Number(form.display_order) || 0,
    };

    try {
      const result = isEdit
        ? await updateCategory(category!.slug, payload)
        : await createCategory(payload);
      onSaved(result);
    } catch (err) {
      const detail =
        err instanceof ApiError && err.message ? err.message : null;
      const fallback = isEdit ? t('updateError') : t('createError');
      toast.error(fallback, detail ?? undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('editTitle') : t('createTitle')}
      size="lg"
      busy={submitting}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={(e) => void handleSubmit(e)}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <Input
          label={t('fieldName')}
          required
          value={form.name}
          placeholder={t('fieldNamePlaceholder')}
          error={errors.name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
              slug: prev.slugTouched ? prev.slug : slugify(e.target.value),
            }))
          }
        />
        <Input
          label={t('fieldSlug')}
          required
          value={form.slug}
          placeholder={t('fieldSlugPlaceholder')}
          helpText={t('fieldSlugHint')}
          error={errors.slug}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              slug: e.target.value,
              slugTouched: true,
            }))
          }
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="categoria-description"
            className="font-sans text-sm font-medium text-text-secondary"
          >
            {t('fieldDescription')}
          </label>
          <textarea
            id="categoria-description"
            value={form.description}
            placeholder={t('fieldDescriptionPlaceholder')}
            rows={3}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className={cn(
              'min-h-[80px] w-full rounded-md border bg-surface-card px-3 py-2 font-sans text-sm text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-action-primary',
              'border-border-default',
            )}
          />
        </div>
        <Input
          label={t('fieldImage')}
          type="url"
          value={form.image_url}
          placeholder={t('fieldImagePlaceholder')}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, image_url: e.target.value }))
          }
        />
        <Input
          label={t('fieldOrder')}
          type="number"
          inputMode="numeric"
          value={form.display_order}
          helpText={t('fieldOrderHint')}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, display_order: e.target.value }))
          }
        />
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({
  category,
  onClose,
  onConfirm,
}: {
  category: Category | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations('admin.categorias');
  return (
    <Modal
      open={category !== null}
      onClose={onClose}
      title={t('deleteTitle')}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-md bg-action-danger px-4 font-sans text-sm font-medium text-text-inverse transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t('deleteConfirm')}
          </button>
        </>
      }
    >
      <p className="font-sans text-sm text-text-secondary">
        {t('deleteMessage', { name: category?.name ?? '' })}
      </p>
    </Modal>
  );
}
