'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import { useToast } from '@/app/components/ui/Toast';
import { getPost } from '@/app/lib/api/posts';
import type { DishReview } from '@/app/lib/types';
import type { ReviewPost } from '@/app/lib/types/social';
import { useDirtyCloseGuard } from '@/app/hooks/useDirtyCloseGuard';
import type { ReviewFormBodyValue } from '@/app/components/social/ReviewFormBody';
import DishReviewForm, {
  buildInitialValue,
  type DishReviewFormInitial,
} from '@/app/[locale]/restaurants/[id]/components/DishReviewForm';

export interface EditPostModalProps {
  postId: string;
  onClose: () => void;
  onUpdated: (postId: string, overlay: Partial<ReviewPost>) => void;
}

function postToInitial(post: ReviewPost): DishReviewFormInitial {
  const extras = post.extras ?? null;
  return {
    rating: post.score,
    note: post.text,
    date_tasted: extras?.dateTasted ?? post.createdAt.slice(0, 10),
    time_tasted: extras?.timeTasted ?? null,
    meal_period: extras?.mealPeriod ?? null,
    price_paid: extras?.pricePaid ?? null,
    portion_size: extras?.portionSize ?? null,
    would_order_again: extras?.wouldOrderAgain ?? null,
    visited_with: extras?.visitedWith ?? null,
    is_anonymous: extras?.isAnonymous ?? false,
    presentation: extras?.presentation ?? null,
    value_prop: extras?.valueProp ?? null,
    execution: extras?.execution ?? null,
    pros_cons: [
      ...(extras?.pros ?? []).map((text) => ({ type: 'pro' as const, text })),
      ...(extras?.cons ?? []).map((text) => ({ type: 'con' as const, text })),
    ],
    tags: (extras?.tags ?? []).map((tag) => ({ tag })),
    // ReviewPost.media doesn't carry the DB id, but URLs are unique enough
    // for identifying which existing photos the user keeps vs removes.
    images: (post.media ?? []).map((m) => ({
      id: m.url,
      url: m.url,
      alt_text: m.alt ?? null,
    })),
  };
}

function reviewToOverlay(
  review: DishReview,
  source: ReviewPost,
  newDishName?: string,
): Partial<ReviewPost> {
  const dishChanged =
    newDishName !== undefined && newDishName !== source.dish.name;
  return {
    score: Number(review.rating),
    text: review.note,
    media: review.images.map((img) => ({
      url: img.url,
      alt: img.alt_text ?? undefined,
    })),
    ...(dishChanged
      ? {
          dish: {
            ...source.dish,
            id: review.dish_id,
            name: newDishName,
          },
        }
      : {}),
    extras: {
      portionSize: review.portion_size,
      wouldOrderAgain: review.would_order_again,
      pros: review.pros_cons.filter((x) => x.type === 'pro').map((x) => x.text),
      cons: review.pros_cons.filter((x) => x.type === 'con').map((x) => x.text),
      tags: review.tags.map((x) => x.tag),
      dateTasted: review.date_tasted,
      timeTasted: review.time_tasted,
      mealPeriod: review.meal_period,
      visitedWith: review.visited_with,
      isAnonymous: review.is_anonymous,
      pricePaid: review.price_paid,
      presentation: review.presentation,
      valueProp: review.value_prop,
      execution: review.execution,
    },
    verifiedByExpert:
      review.presentation != null &&
      review.value_prop != null &&
      review.execution != null,
  };
}

export default function EditPostModal({ postId, onClose, onUpdated }: EditPostModalProps) {
  const t = useTranslations('social.editPost');
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [source, setSource] = useState<ReviewPost | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Mirror del body del form para el dirty check. Se actualiza vía onBodyChange.
  const bodyRef = useRef<ReviewFormBodyValue | null>(null);
  // Snapshot del initial al momento en que se cargó el post.
  const initialRef = useRef<ReviewFormBodyValue | null>(null);

  const isDirty = useCallback((): boolean => {
    const current = bodyRef.current;
    const orig = initialRef.current;
    if (!current || !orig) return false;
    return (
      current.rating !== orig.rating ||
      current.note.trim() !== orig.note.trim() ||
      current.photos.length > 0 ||
      current.existingImages.length !== orig.existingImages.length ||
      current.pros.length !== orig.pros.length ||
      current.cons.length !== orig.cons.length
    );
  }, []);

  const { confirmingDiscard, requestClose, confirmDiscard, cancelDiscard } =
    useDirtyCloseGuard({ isDirty, onClose });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSource(null);
    getPost(postId)
      .then((post) => {
        if (cancelled) return;
        setSource(post);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, t, retryNonce]);

  const initial = useMemo(() => (source ? postToInitial(source) : null), [source]);

  // Captura el snapshot del initial una vez que se carga el post.
  // Se usa para comparar con el body actual y detectar cambios.
  useEffect(() => {
    if (initial) {
      initialRef.current = buildInitialValue(initial);
      bodyRef.current = null; // resetea el mirror para que empiece desde el initial
    }
  }, [initial]);

  const title = source ? t('title', { dishName: source.dish.name }) : t('fallbackTitle');
  const description = source ? source.dish.restaurantName : undefined;

  function handleSuccess(review: DishReview, newDishName?: string) {
    if (!source) return;
    setSubmitting(true);
    onUpdated(postId, reviewToOverlay(review, source, newDishName));
    toast.success(t('savedTitle'), t('savedDescription'));
    setSubmitting(false);
    onClose();
  }

  // Banner de confirmación de descarte — se pasa como footer al Modal cuando está activo.
  const discardBanner = confirmingDiscard ? (
    <div
      role="alertdialog"
      aria-labelledby="edit-discard-title"
      className="w-full motion-safe:animate-[cc-modal-fade-in_150ms_ease-out]"
    >
      <p
        id="edit-discard-title"
        className="mb-3 font-sans text-sm font-semibold text-color-paprika"
      >
        {t('discardConfirmTitle')}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="danger" size="sm" onClick={confirmDiscard}>
          {t('discardConfirmAction')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelDiscard}
          className="text-text-secondary hover:text-text-primary"
        >
          {t('discardCancel')}
        </Button>
      </div>
    </div>
  ) : undefined;

  return (
    <Modal
      open
      onClose={requestClose}
      title={title}
      description={description}
      size="xl"
      position="bottom-sheet"
      busy={submitting}
      kicker={t('kicker')}
      footer={discardBanner}
    >
      {loading ? (
        <div className="flex flex-col gap-3 py-2" aria-label={t('loadingAria')} role="status">
          <Skeleton shape="box" height={32} className="w-1/3 rounded-xl" />
          <Skeleton shape="box" height={80} className="rounded-xl" />
          <Skeleton shape="box" height={44} className="w-2/3 rounded-xl" />
          <Skeleton shape="box" height={44} className="rounded-xl" />
        </div>
      ) : loadError || !source || !initial ? (
        <div className="flex flex-col items-start gap-3">
          <p className="font-sans text-sm text-action-danger" role="alert">
            {loadError ?? t('loadFailed')}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setRetryNonce((n) => n + 1)}>
              {t('retryLoad')}
            </Button>
            <Button variant="ghost" size="sm" onClick={requestClose}>
              {t('close')}
            </Button>
          </div>
        </div>
      ) : (
        <DishReviewForm
          mode="edit"
          reviewId={postId}
          initial={initial}
          dishId={source.dish.id}
          dishName={source.dish.name}
          onSuccess={handleSuccess}
          onCancel={requestClose}
          onBodyChange={(b) => { bodyRef.current = b; }}
        />
      )}
    </Modal>
  );
}
