'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { getPost } from '@/app/lib/api/posts';
import type { DishReview } from '@/app/lib/types';
import type { ReviewPost } from '@/app/lib/types/social';
import DishReviewForm, {
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

function reviewToOverlay(review: DishReview): Partial<ReviewPost> {
  return {
    score: Number(review.rating),
    text: review.note,
    media: review.images.map((img) => ({
      url: img.url,
      alt: img.alt_text ?? undefined,
    })),
    extras: {
      portionSize: review.portion_size,
      wouldOrderAgain: review.would_order_again,
      pros: review.pros_cons.filter((x) => x.type === 'pro').map((x) => x.text),
      cons: review.pros_cons.filter((x) => x.type === 'con').map((x) => x.text),
      tags: review.tags.map((x) => x.tag),
      dateTasted: review.date_tasted,
      timeTasted: review.time_tasted,
      visitedWith: review.visited_with,
      isAnonymous: review.is_anonymous,
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [source, setSource] = useState<ReviewPost | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
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
  }, [postId, t]);

  const initial = useMemo(() => (source ? postToInitial(source) : null), [source]);

  const title = source ? t('title', { dishName: source.dish.name }) : t('fallbackTitle');
  const description = source ? source.dish.restaurantName : undefined;

  function handleSuccess(review: DishReview) {
    onUpdated(postId, reviewToOverlay(review));
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={title} description={description} size="xl">
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
        </div>
      ) : loadError || !source || !initial ? (
        <div className="flex flex-col items-start gap-3">
          <p className="font-sans text-sm text-action-danger" role="alert">
            {loadError ?? t('loadFailed')}
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      ) : (
        <DishReviewForm
          mode="edit"
          reviewId={postId}
          initial={initial}
          dishId={source.dish.id}
          dishName={source.dish.name}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
