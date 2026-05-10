'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import { useToast } from '@/app/components/ui/Toast';
import { useDirtyCloseGuard } from '@/app/hooks/useDirtyCloseGuard';
import {
  getOwnerResponse,
  upsertOwnerResponse,
  type OwnerReviewItem,
} from '@/app/lib/api/owner-content';
import type { OwnerResponse } from '@/app/lib/types/owner-content';
import { readLocalDraft, writeLocalDraft } from '@/app/lib/utils/owner-draft';
import ReviewEmojiChips from './ReviewEmojiChips';

interface Props {
  review: OwnerReviewItem;
  onClose: () => void;
  onResponseSaved?: () => void;
  /**
   * Optional draft to pre-fill the textarea when no response exists
   * yet. Used by the chat deep-link ("Responder esta reseña con este
   * draft") so the owner lands in the modal with the agent's
   * suggestion already loaded. Ignored when a response is already
   * persisted — we never overwrite the owner's own work.
   *
   * Priority order on open:
   *   persisted response > initialDraft (explicit user action this
   *   turn) > local draft (auto-saved earlier session) > empty.
   */
  initialDraft?: string;
}

export default function OwnerReviewModal({
  review,
  onClose,
  onResponseSaved,
  initialDraft,
}: Props) {
  const t = useTranslations('ownerDashboard');
  const tModal = useTranslations('ownerDashboard.reviewModal');
  const locale = useLocale();
  const toast = useToast();
  const [response, setResponse] = useState<OwnerResponse | null>(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * Tells the user where the prefilled body came from — only when
   * it didn't come from a published response. Empty otherwise so
   * we don't surprise the owner with a banner on a fresh open.
   */
  const [draftSource, setDraftSource] = useState<
    'chat' | 'local' | null
  >(null);

  const { confirmingDiscard, requestClose, confirmDiscard, cancelDiscard } =
    useDirtyCloseGuard({
      isDirty: () =>
        response
          ? body.trim() !== response.body.trim()
          : body.trim().length > 0,
      onClose,
    });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOwnerResponse(review.id)
      .then((r) => {
        if (cancelled) return;
        setResponse(r);
        if (r?.body) {
          // Published response wins over every draft source. We
          // never silently overwrite owner work that already shipped.
          setBody(r.body);
          setDraftSource(null);
          return;
        }
        if (initialDraft) {
          // Explicit deep-link click this turn — agent's suggestion
          // overrides any stale local draft. Persist immediately so
          // a close-without-typing still leaves a recoverable draft
          // (the dashboard's "Borrador" badge depends on it).
          setBody(initialDraft);
          writeLocalDraft(review.id, initialDraft);
          setDraftSource('chat');
          return;
        }
        const local = readLocalDraft(review.id);
        if (local) {
          setBody(local);
          setDraftSource('local');
          return;
        }
        setBody('');
        setDraftSource(null);
      })
      .catch(() => {
        if (cancelled) return;
        setResponse(null);
        // GET failed — still try to surface a local draft so a flaky
        // backend doesn't make the owner retype their reply.
        const local = readLocalDraft(review.id);
        if (initialDraft) {
          setBody(initialDraft);
          writeLocalDraft(review.id, initialDraft);
          setDraftSource('chat');
        } else if (local) {
          setBody(local);
          setDraftSource('local');
        } else {
          setBody('');
          setDraftSource(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [review.id, initialDraft]);

  const handleBodyChange = useCallback(
    (next: string) => {
      setBody(next);
      // Don't auto-save while the published response is in the
      // textarea — that text is already in the DB; mirroring it to
      // localStorage would add a stale copy that lingers after the
      // owner edits + saves.
      if (response) return;
      writeLocalDraft(review.id, next);
      // Once the owner starts typing, the source banner has done its
      // job. Clearing it avoids an awkward "from chat" label sitting
      // above text the owner already rewrote.
      if (draftSource !== null) setDraftSource(null);
    },
    [response, review.id, draftSource],
  );

  const handleSave = async () => {
    if (body.trim().length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await upsertOwnerResponse(review.id, body.trim());
      setResponse(updated);
      // Response is now persisted server-side — drop the local copy
      // so a future open shows the published text, not a stale draft.
      writeLocalDraft(review.id, '');
      setDraftSource(null);
      toast.success(
        tModal('publishedTitle'),
        tModal('publishedDescription'),
      );
      onResponseSaved?.();
    } catch {
      setError(tModal('saveError'));
    } finally {
      setSaving(false);
    }
  };

  // Build author label for the Modal description prop
  const authorLabel = review.is_anonymous
    ? t('anonymous')
    : review.user_handle
      ? `@${review.user_handle}`
      : review.user_display_name;

  // Footer swaps between confirm-discard banner and normal action buttons
  const modalFooter = confirmingDiscard ? (
    <div className="flex w-full flex-col gap-3 rounded-md border border-action-danger/30 bg-action-danger/5 p-3">
      <p className="font-sans text-sm text-text-primary">
        {tModal('dirtyCloseWarning')}
      </p>
      <div className="flex gap-2">
        <Button variant="danger" size="sm" onClick={confirmDiscard}>
          {tModal('dirtyCloseConfirm')}
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelDiscard}>
          {tModal('dirtyCloseCancel')}
        </Button>
      </div>
    </div>
  ) : (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => requestClose()}
        disabled={saving}
      >
        {tModal('closeAction')}
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => void handleSave()}
        disabled={saving || body.trim().length === 0}
        loading={saving}
      >
        {response ? tModal('updateAction') : tModal('respondAction')}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onClose={requestClose}
      kicker={tModal('kicker')}
      title={tModal('title', { dish: review.dish_name })}
      description={`${authorLabel} · ${new Date(review.date_tasted).toLocaleDateString(locale)}  ★ ${review.rating.toFixed(1)}`}
      position="bottom-sheet"
      size="xl"
      busy={saving}
      footer={modalFooter}
    >
      <ReviewEmojiChips review={review} />

      <p className="mt-3 whitespace-pre-wrap font-sans text-sm text-text-primary">
        {review.note}
      </p>

      <div className="mt-4 flex flex-col gap-2 border-t border-border-default pt-4">
        <h3 className="font-display text-base font-medium">
          {response ? tModal('yourResponseHeading') : tModal('respondHeading')}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {draftSource && (
              <p className="rounded-md bg-action-primary/10 px-3 py-2 font-sans text-xs text-text-primary">
                {draftSource === 'chat'
                  ? tModal('draftFromChatNotice')
                  : tModal('draftFromLocalNotice')}
              </p>
            )}
            <textarea
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              rows={4}
              placeholder={tModal('responsePlaceholder')}
              className="w-full rounded-md border border-border-default bg-surface-subtle p-3 font-sans text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-terracota-deep)]"
            />
            {error && (
              <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-xs text-action-danger">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
