'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import PostCard from '@/app/components/social/PostCard';
import { usePostsInteraction } from '@/app/lib/hooks/usePostsInteraction';
import { getDishReviews } from '@/app/lib/api/dishes-social';
import type { ReviewPost } from '@/app/lib/types/social';

type SortKey = 'recent' | 'best' | 'worst';

interface DishReviewsTabProps {
  dishId: string;
  initialReviews: ReviewPost[];
  initialCursor: string | null;
}

export default function DishReviewsTab({
  dishId,
  initialReviews,
  initialCursor,
}: DishReviewsTabProps) {
  const router = useRouter();
  const t = useTranslations('dish.reviewsTab');
  const { posts, setPosts, toggleLike, toggleSave } = usePostsInteraction(initialReviews);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);

  const sorted = useMemo(() => {
    const filtered = withPhotosOnly ? posts.filter((p) => (p.media?.length ?? 0) > 0) : posts;
    const copy = [...filtered];
    switch (sortKey) {
      case 'best':
        copy.sort((a, b) => b.score - a.score);
        break;
      case 'worst':
        copy.sort((a, b) => a.score - b.score);
        break;
      default:
        copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return copy;
  }, [posts, sortKey, withPhotosOnly]);

  const handleLoadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const next = await getDishReviews(dishId, cursor);
      setPosts((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }, [cursor, dishId, loading, setPosts]);

  if (posts.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-white)] p-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--color-carbon)]">
          {t('emptyTitle')}
        </p>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          {t('emptyDescription')}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
          {t('heading', { count: posts.length })}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-carbon-soft)]">
            {t('sortLabel')}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-full border border-[var(--color-crema-darker)] bg-white px-2 py-1 text-xs text-[var(--color-carbon)]"
            >
              <option value="recent">{t('sortRecent')}</option>
              <option value="best">{t('sortBest')}</option>
              <option value="worst">{t('sortWorst')}</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-carbon-soft)]">
            <input
              type="checkbox"
              checked={withPhotosOnly}
              onChange={(e) => setWithPhotosOnly(e.target.checked)}
              className="accent-[var(--color-azafran)]"
            />
            {t('withPhotosOnly')}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpenPost={(id) => router.push(`/reviews/${id}`)}
            onOpenDish={undefined}
            onOpenAuthor={(id) => router.push(`/u/${id}`)}
            onOpenRestaurant={(id) => router.push(`/restaurants/${id}`)}
            onToggleLike={(id, next) => void toggleLike(id, next)}
            onToggleSave={(id, next) => void toggleSave(id, next)}
            onComment={(id) => router.push(`/reviews/${id}#comments`)}
          />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-full border border-[var(--color-crema-darker)] bg-white px-5 py-2 text-sm font-semibold text-[var(--color-carbon)] transition hover:border-[var(--color-azafran)] disabled:opacity-50"
          >
            {loading ? t('loading') : t('loadMore')}
          </button>
        </div>
      )}
    </section>
  );
}
