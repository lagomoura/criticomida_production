'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import Select from '@/app/components/ui/Select';
import { useToast } from '@/app/components/ui/Toast';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { getCategories } from '@/app/lib/api/categories';
import { updateRestaurant } from '@/app/lib/api/restaurants';
import { Category } from '@/app/lib/types';

interface Props {
  restaurantSlug: string;
  restaurantName: string;
  currentCategoryId: number | null;
}

export default function RestaurantCategoryEditor({
  restaurantSlug,
  restaurantName,
  currentCategoryId,
}: Props) {
  const { user } = useAuthContext();
  const t = useTranslations('restaurantCategoryEditor');
  const toast = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(currentCategoryId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    setLoading(true);
    getCategories()
      .then((cats) => {
        const sorted = [...cats].sort((a, b) =>
          a.display_order !== b.display_order
            ? a.display_order - b.display_order
            : a.name.localeCompare(b.name),
        );
        setCategories(sorted);
      })
      .finally(() => setLoading(false));
  }, [open, categories.length]);

  if (user?.role !== 'admin') return null;

  const handleSave = async () => {
    if (selectedId === null || selectedId === currentCategoryId) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await updateRestaurant(restaurantSlug, { category_id: selectedId });
      toast.success(t('success'));
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" aria-hidden />
        {t('trigger')}
      </button>

      <Modal
        open={open}
        onClose={() => (saving ? null : setOpen(false))}
        title={t('title')}
        description={t('description', { name: restaurantName })}
        size="md"
        busy={saving}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              loading={saving}
              disabled={saving || selectedId === null}
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </>
        }
      >
        <Select
          label={t('selectLabel')}
          value={selectedId ?? ''}
          onChange={(e) =>
            setSelectedId(e.target.value === '' ? null : Number(e.target.value))
          }
          disabled={loading || saving}
        >
          {loading && <option value="">…</option>}
          {!loading && selectedId === null && <option value="">—</option>}
          {!loading &&
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
      </Modal>
    </>
  );
}
