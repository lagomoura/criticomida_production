'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import {
  getOwnerResponse,
  upsertOwnerResponse,
  type OwnerReviewItem,
} from '@/app/lib/api/owner-content';
import type { OwnerResponse } from '@/app/lib/types/owner-content';
import ReviewEmojiChips from './ReviewEmojiChips';

interface Props {
  review: OwnerReviewItem;
  onClose: () => void;
  onResponseSaved?: () => void;
}

export default function OwnerReviewModal({
  review,
  onClose,
  onResponseSaved,
}: Props) {
  const t = useTranslations('ownerDashboard');
  const tModal = useTranslations('ownerDashboard.reviewModal');
  const locale = useLocale();
  const [response, setResponse] = useState<OwnerResponse | null>(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOwnerResponse(review.id)
      .then((r) => {
        if (cancelled) return;
        setResponse(r);
        setBody(r?.body ?? '');
      })
      .catch(() => {
        if (cancelled) return;
        setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [review.id]);

  const handleSave = async () => {
    if (body.trim().length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await upsertOwnerResponse(review.id, body.trim());
      setResponse(updated);
      onResponseSaved?.();
    } catch {
      setError(tModal('saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-review-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-t-2xl bg-surface-card p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <button
          type="button"
          aria-label={tModal('closeAction')}
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-text-muted hover:bg-surface-subtle"
        >
          ✕
        </button>

        <header className="flex flex-col gap-1 pr-8">
          <p
            id="owner-review-modal-title"
            className="font-display text-xl font-medium"
          >
            {review.dish_name}{' '}
            <span className="font-sans text-sm text-text-muted">
              ★ {review.rating.toFixed(1)}
            </span>
          </p>
          <p className="font-sans text-xs text-text-muted">
            {review.is_anonymous
              ? t('anonymous')
              : review.user_handle
                ? `@${review.user_handle}`
                : review.user_display_name}{' '}
            · {new Date(review.date_tasted).toLocaleDateString(locale)}
          </p>
        </header>

        <ReviewEmojiChips review={review} />

        <p className="whitespace-pre-wrap font-sans text-sm text-text-primary">
          {review.note}
        </p>

        <div className="flex flex-col gap-2 border-t border-border-default pt-4">
          <h3 className="font-display text-base font-medium">
            {response
              ? tModal('yourResponseHeading')
              : tModal('respondHeading')}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder={tModal('responsePlaceholder')}
                className="w-full rounded-md border border-border-default bg-surface-subtle p-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-canela)]"
              />
              {error && (
                <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-xs text-action-danger">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={saving}
                >
                  {tModal('closeAction')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={saving || body.trim().length === 0}
                >
                  {saving
                    ? tModal('savingAction')
                    : response
                      ? tModal('updateAction')
                      : tModal('respondAction')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
